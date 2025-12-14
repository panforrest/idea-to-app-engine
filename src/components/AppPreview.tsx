import { useState, useEffect, useRef, forwardRef } from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Palette, 
  Layout, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  Monitor,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Screen {
  name: string;
  description: string;
  keyElements: string[];
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface AppPreviewData {
  appName: string;
  tagline: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  screens: Screen[];
  keyFeatures: Feature[];
  userFlow: string;
  uniqueSellingPoint: string;
  monetizationUI: string;
}

interface AppPreviewProps {
  idea: string;
  analysis: any;
}

const AppPreview = forwardRef<HTMLDivElement, AppPreviewProps>(({ idea, analysis }, ref) => {
  const [appPreview, setAppPreview] = useState<AppPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState(0);
  const hasGenerated = useRef(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Only generate once per idea
    if (!hasGenerated.current && idea) {
      hasGenerated.current = true;
      generatePreview();
    }
  }, [idea]);

  const generatePreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-app-preview", {
        body: { idea, analysis },
      });

      if (fnError) throw fnError;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setAppPreview(data.appPreview);
    } catch (e) {
      console.error("Error generating app preview:", e);
      setError(e instanceof Error ? e.message : "Failed to generate preview");
      toast({
        title: "Preview Generation Failed",
        description: "Could not generate app preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-5xl mx-auto"
      >
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-pulse" />
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Generating Your App Preview</h3>
            <p className="text-muted-foreground">Our AI is designing your app concept...</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error || !appPreview) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-5xl mx-auto"
      >
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">{error || "No preview available"}</p>
            <Button onClick={generatePreview}>Try Again</Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* App Header */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div 
            className="h-3" 
            style={{ 
              background: `linear-gradient(to right, ${appPreview.colorScheme.primary}, ${appPreview.colorScheme.secondary}, ${appPreview.colorScheme.accent})` 
            }} 
          />
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
                style={{ backgroundColor: appPreview.colorScheme.primary + "20" }}
              >
                <Sparkles className="w-10 h-10" style={{ color: appPreview.colorScheme.primary }} />
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold mb-2">{appPreview.appName}</h2>
                <p className="text-lg text-muted-foreground">{appPreview.tagline}</p>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-1">
                  {Object.values(appPreview.colorScheme).map((color, i) => (
                    <div 
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Screens Preview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              App Screens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {appPreview.screens.map((screen, index) => (
                <Button
                  key={index}
                  variant={activeScreen === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveScreen(index)}
                  className="whitespace-nowrap"
                >
                  {screen.name}
                </Button>
              ))}
            </div>
            
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Phone Mockup */}
              <div className="relative mx-auto">
                <div 
                  className="w-64 h-[500px] rounded-[2.5rem] p-3 shadow-2xl"
                  style={{ backgroundColor: appPreview.colorScheme.primary + "10", border: `3px solid ${appPreview.colorScheme.primary}40` }}
                >
                  <div className="w-full h-full rounded-[2rem] bg-background overflow-hidden">
                    {/* Status bar */}
                    <div 
                      className="h-8 flex items-center justify-center"
                      style={{ backgroundColor: appPreview.colorScheme.primary }}
                    >
                      <div className="w-20 h-1.5 bg-white/30 rounded-full" />
                    </div>
                    
                    {/* Screen content */}
                    <div className="p-4 space-y-4">
                      <div 
                        className="text-sm font-semibold"
                        style={{ color: appPreview.colorScheme.primary }}
                      >
                        {appPreview.screens[activeScreen].name}
                      </div>
                      
                      {appPreview.screens[activeScreen].keyElements.map((element, i) => (
                        <div 
                          key={i}
                          className="h-12 rounded-lg flex items-center px-4 gap-3"
                          style={{ 
                            backgroundColor: i === 0 
                              ? appPreview.colorScheme.primary + "15" 
                              : appPreview.colorScheme.secondary + "10"
                          }}
                        >
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: appPreview.colorScheme.accent }}
                          />
                          <span className="text-xs text-muted-foreground">{element}</span>
                        </div>
                      ))}
                      
                      <div 
                        className="h-10 rounded-lg flex items-center justify-center text-xs font-medium text-white mt-auto"
                        style={{ backgroundColor: appPreview.colorScheme.primary }}
                      >
                        Primary Action
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Screen Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">{appPreview.screens[activeScreen].name}</h4>
                  <p className="text-muted-foreground">{appPreview.screens[activeScreen].description}</p>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Key Elements</h5>
                  <div className="flex flex-wrap gap-2">
                    {appPreview.screens[activeScreen].keyElements.map((element, i) => (
                      <Badge key={i} variant="secondary">{element}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Features */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5 text-primary" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {appPreview.keyFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Flow & USP */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-4 h-4 text-primary" />
                User Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{appPreview.userFlow}</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-primary" />
                Monetization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{appPreview.monetizationUI}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <Monitor className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Ready to Build This?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Turn this concept into reality. Subscribe to FlowGladiator and start building your app today.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/pricing")}
              className="gap-2"
            >
              View Plans <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
});

AppPreview.displayName = "AppPreview";

export default AppPreview;
