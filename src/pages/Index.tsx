import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import IdeaInputSection from "@/components/IdeaInputSection";
import AnalysisResults from "@/components/AnalysisResults";
import AppPreview from "@/components/AppPreview";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalysisData {
  summary: string;
  viabilityScore: number;
  marketPotential: "low" | "medium" | "high";
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  targetAudience: string;
  competitiveAdvantage: string;
  revenueModel: string;
  nextSteps: string[];
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [submittedIdea, setSubmittedIdea] = useState("");
  const { user } = useAuth();

  const scrollToGenerator = () => {
    const generatorSection = document.getElementById("generator");
    if (generatorSection) {
      generatorSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleIdeaSubmit = async (idea: string) => {
    setIsLoading(true);
    setAnalysis(null);
    setSubmittedIdea(idea);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-idea', {
        body: { idea }
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze idea');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);

      // Save to database if user is logged in
      if (user) {
        await supabase.from('analyses').insert({
          user_id: user.id,
          idea,
          analysis: data.analysis
        });
      }

      toast({
        title: "Analysis Complete!",
        description: "Your startup idea has been analyzed. Check out the results below.",
      });

      // Scroll to results
      setTimeout(() => {
        const resultsSection = document.getElementById("results");
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

    } catch (error) {
      console.error('Error analyzing idea:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
    setSubmittedIdea("");
    scrollToGenerator();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onGetStarted={scrollToGenerator} />
      
      <main>
        <HeroSection onGetStarted={scrollToGenerator} />
        
        <IdeaInputSection onSubmit={handleIdeaSubmit} isLoading={isLoading} />
        
        {/* Analysis Results Section */}
        {analysis && (
          <section id="results" className="py-16 px-4">
            <div className="max-w-5xl mx-auto">
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="analysis">📊 Analysis</TabsTrigger>
                  <TabsTrigger value="preview">🎨 App Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="analysis">
                  <AnalysisResults analysis={analysis} idea={submittedIdea} />
                </TabsContent>
                <TabsContent value="preview">
                  <AppPreview key={`preview-${submittedIdea}`} idea={submittedIdea} analysis={analysis} />
                </TabsContent>
              </Tabs>
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleNewAnalysis}
                  className="px-6 py-3 text-sm font-medium rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  Analyze Another Idea
                </button>
              </div>
            </div>
          </section>
        )}
        
        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
