import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBilling } from "@/contexts/FlowgladContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Free",
    priceSlug: null,
    price: 0,
    interval: "month",
    description: "Perfect for getting started",
    icon: Sparkles,
    features: [
      "3 idea analyses per month",
      "Basic viability scores",
      "Market potential insights",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    priceSlug: "pro_monthly",
    price: 19,
    interval: "month",
    description: "For serious entrepreneurs",
    icon: Zap,
    features: [
      "Unlimited idea analyses",
      "Advanced viability metrics",
      "Competitor analysis",
      "Revenue model suggestions",
      "Priority email support",
      "Export reports as PDF",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    priceSlug: "enterprise_monthly",
    price: 49,
    interval: "month",
    description: "For teams and agencies",
    icon: Crown,
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom AI prompts",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "White-label reports",
    ],
    popular: false,
  },
];

const Pricing = () => {
  const { billing, isLoading: billingLoading, createCheckoutSession, loaded } = useBilling();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (priceSlug: string | null) => {
    if (!priceSlug) {
      // Free plan - just navigate to home
      navigate("/");
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to a plan.",
      });
      navigate("/auth");
      return;
    }

    setLoadingPlan(priceSlug);

    try {
      await createCheckoutSession({
        priceSlug,
        successUrl: `${window.location.origin}/pricing?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        autoRedirect: true,
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  // Check for success/cancel in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      toast({
        title: "Success!",
        description: "Your subscription is now active.",
      });
      window.history.replaceState({}, "", "/pricing");
    } else if (params.get("canceled")) {
      toast({
        title: "Checkout canceled",
        description: "You can try again anytime.",
      });
      window.history.replaceState({}, "", "/pricing");
    }
  }, []);

  const currentPlanSlug = billing?.currentSubscription?.priceId;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onGetStarted={() => navigate("/")} />
      
      <main className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. All plans include our core idea analysis features.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const isCurrentPlan = plan.priceSlug && currentPlanSlug === plan.priceSlug;
              const isLoading = loadingPlan === plan.priceSlug;

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`relative h-full flex flex-col ${
                      plan.popular
                        ? "border-primary shadow-lg shadow-primary/10"
                        : "border-border"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <div className="text-center mb-6">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.interval}</span>
                      </div>

                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                        disabled={isLoading || billingLoading || isCurrentPlan}
                        onClick={() => handleSelectPlan(plan.priceSlug)}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : isCurrentPlan ? (
                          "Current Plan"
                        ) : plan.priceSlug ? (
                          "Get Started"
                        ) : (
                          "Start Free"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ or additional info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-muted-foreground">
              All plans include a 14-day free trial. No credit card required for free plan.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
