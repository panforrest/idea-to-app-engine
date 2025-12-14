import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FLOWGLAD_API_URL = "https://app.flowglad.com/api";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FLOWGLAD_SECRET_KEY = Deno.env.get("FLOWGLAD_SECRET_KEY");
    if (!FLOWGLAD_SECRET_KEY) {
      throw new Error("FLOWGLAD_SECRET_KEY is not configured");
    }

    // Get authorization header to identify user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client to get user info
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, ...params } = await req.json();
    console.log(`FlowGlad action: ${action} for user: ${user.id}`);

    // Helper to make FlowGlad API requests
    const flowgladRequest = async (endpoint: string, method: string = "GET", body?: any) => {
      const response = await fetch(`${FLOWGLAD_API_URL}${endpoint}`, {
        method,
        headers: {
          "Authorization": `Bearer ${FLOWGLAD_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        ...(body && { body: JSON.stringify(body) }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`FlowGlad API error: ${response.status} - ${errorText}`);
        throw new Error(`FlowGlad API error: ${response.status}`);
      }

      return response.json();
    };

    // Find or create customer based on user ID
    const findOrCreateCustomer = async () => {
      // Try to find existing customer by external ID
      try {
        const customersResponse = await flowgladRequest(`/customers?externalId=${user.id}`);
        if (customersResponse.data && customersResponse.data.length > 0) {
          return customersResponse.data[0];
        }
      } catch (e) {
        console.log("Customer not found, creating new one");
      }

      // Create new customer
      const newCustomer = await flowgladRequest("/customers", "POST", {
        externalId: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      });

      return newCustomer;
    };

    let result: any;

    switch (action) {
      case "getBilling": {
        const customer = await findOrCreateCustomer();
        
        // Get subscriptions for customer
        let subscriptions: any[] = [];
        try {
          const subsResponse = await flowgladRequest(`/subscriptions?customerId=${customer.id}`);
          subscriptions = subsResponse.data || [];
        } catch (e) {
          console.log("No subscriptions found");
        }

        // Get invoices for customer
        let invoices: any[] = [];
        try {
          const invoicesResponse = await flowgladRequest(`/invoices?customerId=${customer.id}`);
          invoices = invoicesResponse.data || [];
        } catch (e) {
          console.log("No invoices found");
        }

        // Get catalog/pricing model
        let pricingModel: any = null;
        try {
          pricingModel = await flowgladRequest("/pricing-models/default");
        } catch (e) {
          console.log("No pricing model found");
        }

        result = {
          customer,
          subscriptions,
          currentSubscription: subscriptions.find(s => s.status === "active" || s.status === "trialing") || null,
          invoices,
          pricingModel,
        };
        break;
      }

      case "createCheckoutSession": {
        const customer = await findOrCreateCustomer();
        const { priceSlug, priceId, successUrl, cancelUrl, quantity = 1 } = params;

        const checkoutSession = await flowgladRequest("/checkout-sessions", "POST", {
          customerId: customer.id,
          ...(priceSlug && { priceSlug }),
          ...(priceId && { priceId }),
          successUrl,
          cancelUrl,
          quantity,
        });

        result = checkoutSession;
        break;
      }

      case "cancelSubscription": {
        const { subscriptionId, timing = "at_end_of_current_billing_period" } = params;
        
        result = await flowgladRequest(`/subscriptions/${subscriptionId}/cancel`, "POST", {
          timing,
        });
        break;
      }

      case "getCatalog": {
        result = await flowgladRequest("/pricing-models/default");
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("FlowGlad billing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
