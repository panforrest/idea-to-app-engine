import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Calendar, Receipt, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useBilling } from "@/contexts/FlowgladContext";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Billing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { billing, isLoading, loaded, reload, cancelSubscription } = useBilling();
  const [isCanceling, setIsCanceling] = useState(false);

  // Redirect to auth if not logged in
  if (!user && loaded) {
    navigate("/auth");
    return null;
  }

  const handleCancelSubscription = async () => {
    if (!billing?.currentSubscription) return;

    setIsCanceling(true);
    try {
      await cancelSubscription(billing.currentSubscription.id);
      toast({
        title: "Subscription Canceled",
        description: "Your subscription will remain active until the end of your billing period.",
      });
    } catch (error) {
      console.error("Cancel error:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const formatDate = (dateValue: string | number | undefined) => {
    if (!dateValue) return "N/A";
    
    // Handle both string dates and numeric timestamps (milliseconds)
    const date = typeof dateValue === "number" 
      ? new Date(dateValue) 
      : new Date(dateValue);
    
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case "trialing":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Trial</Badge>;
      case "canceled":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Canceled</Badge>;
      case "past_due":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Past Due</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onGetStarted={() => navigate("/pricing")} />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                <span className="text-foreground">Billing</span>
                <span className="text-primary"> Management</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your subscription and view billing history
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current Subscription */}
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Current Subscription
                    </CardTitle>
                    <CardDescription>
                      Your active plan and billing details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {billing?.currentSubscription ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold">
                              {billing.currentSubscription.priceId.includes("enterprise") ? "Enterprise" : "Pro"} Plan
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Billed monthly
                            </p>
                          </div>
                          {getStatusBadge(billing.currentSubscription.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Current Period Ends</p>
                              <p className="font-medium">
                                {formatDate(
                                  billing.currentSubscription.currentPeriodEnd || 
                                  billing.currentSubscription.current_period_end
                                )}
                              </p>
                            </div>
                          </div>
                          {(billing.currentSubscription.cancelScheduledAt || 
                            billing.currentSubscription.canceledAt || 
                            billing.currentSubscription.canceled_at) && (
                            <div className="flex items-center gap-3">
                              <AlertCircle className="w-5 h-5 text-yellow-500" />
                              <div>
                                <p className="text-sm text-muted-foreground">Cancels On</p>
                                <p className="font-medium text-yellow-500">
                                  {formatDate(
                                    billing.currentSubscription.cancelScheduledAt || 
                                    billing.currentSubscription.canceledAt ||
                                    billing.currentSubscription.canceled_at
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {!billing.currentSubscription.cancelScheduledAt && (
                          <div className="pt-4">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                                  Cancel Subscription
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Your subscription will remain active until the end of your current billing period. 
                                    You won't be charged again, but you'll lose access to premium features after 
                                    {" "}{formatDate(billing.currentSubscription.currentPeriodEnd)}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleCancelSubscription}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isCanceling}
                                  >
                                    {isCanceling ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Canceling...
                                      </>
                                    ) : (
                                      "Yes, Cancel"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No active subscription</p>
                        <Button onClick={() => navigate("/pricing")}>
                          View Plans
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Billing History */}
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-primary" />
                      Billing History
                    </CardTitle>
                    <CardDescription>
                      Your past invoices and payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {billing?.invoices && billing.invoices.length > 0 ? (
                      <div className="space-y-3">
                        {billing.invoices.map((invoice) => (
                          <div
                            key={invoice.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30"
                          >
                            <div>
                              <p className="font-medium">{formatCurrency(invoice.total)}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(invoice.createdAt)}
                              </p>
                            </div>
                            {getStatusBadge(invoice.status)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No invoices yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Info */}
                {billing?.customer && (
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{billing.customer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{billing.customer.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Billing;
