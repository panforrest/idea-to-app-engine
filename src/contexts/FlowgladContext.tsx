import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Customer {
  id: string;
  externalId: string;
  email: string;
  name: string;
}

interface Subscription {
  id: string;
  status: string;
  priceId: string;
  // FlowGlad may use different field names - support both
  currentPeriodStart?: string | number;
  currentPeriodEnd?: string | number;
  current_period_start?: string | number;
  current_period_end?: string | number;
  cancelScheduledAt?: string | number;
  canceledAt?: string | number;
  canceled_at?: string | number;
}

interface Invoice {
  id: string;
  status: string;
  total: number;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Price {
  id: string;
  slug: string;
  productId: string;
  unitPrice: number;
  intervalUnit?: string;
  intervalCount?: number;
}

interface PricingModel {
  id: string;
  name: string;
  products: Product[];
  prices: Price[];
}

interface BillingData {
  customer: Customer | null;
  subscriptions: Subscription[];
  currentSubscription: Subscription | null;
  invoices: Invoice[];
  pricingModel: PricingModel | null;
}

interface CheckoutSessionParams {
  priceSlug?: string;
  priceId?: string;
  successUrl: string;
  cancelUrl: string;
  quantity?: number;
  autoRedirect?: boolean;
}

interface FlowgladContextType {
  billing: BillingData | null;
  isLoading: boolean;
  error: Error | null;
  loaded: boolean;
  reload: () => Promise<void>;
  createCheckoutSession: (params: CheckoutSessionParams) => Promise<{ url: string } | null>;
  cancelSubscription: (subscriptionId: string, timing?: string) => Promise<void>;
  checkFeatureAccess: (featureSlug: string) => boolean;
}

const FlowgladContext = createContext<FlowgladContextType | null>(null);

export function FlowgladProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchBilling = useCallback(async () => {
    // Only fetch if we have both user and session
    if (!user || !session) {
      setBilling(null);
      setError(null);
      setLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("flowglad-billing", {
        body: { action: "getBilling" },
      });

      // Handle various error formats from Supabase
      if (fnError) {
        // Check if it's an auth-related error - silently handle these
        const isAuthError = 
          fnError.name === "FunctionsHttpError" ||
          String(fnError.message || "").includes("401") ||
          String(fnError.message || "").includes("Unauthorized") ||
          String(fnError.message || "").includes("non-2xx") ||
          String(fnError.message || "").includes("Session not found");
        
        if (isAuthError) {
          console.log("Billing: Auth issue, skipping billing fetch");
          setBilling(null);
          return;
        }
        throw fnError;
      }
      
      // Also check if data contains an error (edge function might return error in body)
      if (data?.error) {
        const errorStr = String(data.error);
        if (errorStr.includes("Unauthorized") || errorStr.includes("401") || errorStr.includes("Session")) {
          console.log("Billing: Auth issue from response, skipping billing fetch");
          setBilling(null);
          return;
        }
      }
      
      setBilling(data);
    } catch (e: any) {
      // Silently handle auth errors - don't show error state
      const errorMessage = e?.message || e?.name || e?.toString() || String(e);
      const isAuthError = 
        errorMessage.includes("401") || 
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("FunctionsHttpError") ||
        errorMessage.includes("non-2xx") ||
        errorMessage.includes("Session");
      
      if (!isAuthError) {
        console.error("Error fetching billing:", e);
        setError(e instanceof Error ? e : new Error("Failed to fetch billing"));
      } else {
        console.log("Billing: Caught auth error, gracefully handling");
        setBilling(null);
      }
    } finally {
      setIsLoading(false);
      setLoaded(true);
    }
  }, [user, session]);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  const createCheckoutSession = async (params: CheckoutSessionParams) => {
    // Verify we have an active session before making the request
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      throw new Error("Please log in to continue");
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke("flowglad-billing", {
        body: { action: "createCheckoutSession", ...params },
      });

      if (fnError) {
        // Check if it's an auth error
        const isAuthError = 
          fnError.name === "FunctionsHttpError" ||
          String(fnError.message || "").includes("401") ||
          String(fnError.message || "").includes("Unauthorized");
        
        if (isAuthError) {
          throw new Error("Session expired. Please log in again.");
        }
        throw fnError;
      }

      if (params.autoRedirect && data?.url) {
        window.location.href = data.url;
      }

      return data;
    } catch (e: any) {
      console.error("Error creating checkout session:", e);
      throw e;
    }
  };

  const cancelSubscription = async (subscriptionId: string, timing = "at_end_of_current_billing_period") => {
    try {
      const { error: fnError } = await supabase.functions.invoke("flowglad-billing", {
        body: { action: "cancelSubscription", subscriptionId, timing },
      });

      if (fnError) throw fnError;

      // Reload billing data
      await fetchBilling();
    } catch (e) {
      console.error("Error canceling subscription:", e);
      throw e;
    }
  };

  const checkFeatureAccess = (featureSlug: string) => {
    // Check if user has an active subscription
    if (!billing?.currentSubscription) {
      return false;
    }

    // For now, any active subscription grants feature access
    // This can be enhanced to check specific features based on plan
    return billing.currentSubscription.status === "active" || 
           billing.currentSubscription.status === "trialing";
  };

  return (
    <FlowgladContext.Provider
      value={{
        billing,
        isLoading,
        error,
        loaded,
        reload: fetchBilling,
        createCheckoutSession,
        cancelSubscription,
        checkFeatureAccess,
      }}
    >
      {children}
    </FlowgladContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(FlowgladContext);
  if (!context) {
    throw new Error("useBilling must be used within a FlowgladProvider");
  }
  return context;
}
