import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea, analysis } = await req.json();
    
    if (!idea) {
      return new Response(
        JSON.stringify({ error: 'Please provide the startup idea' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating app preview for:', idea.substring(0, 50) + '...');

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a creative app designer and product visionary. Based on the startup idea and analysis provided, generate a compelling app concept with visual descriptions.

Return a JSON object with this exact structure:
{
  "appName": "A catchy, memorable app name",
  "tagline": "A short 5-10 word tagline",
  "colorScheme": {
    "primary": "A hex color code",
    "secondary": "A hex color code", 
    "accent": "A hex color code"
  },
  "screens": [
    {
      "name": "Screen name (e.g., Dashboard, Profile, etc.)",
      "description": "Brief description of what this screen shows",
      "keyElements": ["element 1", "element 2", "element 3"]
    }
  ],
  "keyFeatures": [
    {
      "icon": "emoji representing the feature",
      "title": "Feature name",
      "description": "One sentence description"
    }
  ],
  "userFlow": "A brief description of the main user journey through the app",
  "uniqueSellingPoint": "What makes this app stand out visually and functionally",
  "monetizationUI": "How the pricing/payment would be presented to users"
}

Generate exactly 4 screens and 4 key features. Be creative and specific to the startup idea.`;

    const userMessage = `Generate an app preview for this startup idea:

IDEA: ${idea}

ANALYSIS CONTEXT:
- Target Audience: ${analysis?.targetAudience || 'General users'}
- Revenue Model: ${analysis?.revenueModel || 'Subscription-based'}
- Competitive Advantage: ${analysis?.competitiveAdvantage || 'Innovative solution'}

Create a modern, professional app concept that would appeal to the target audience.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate app preview");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    console.log('AI response received, parsing app preview...');

    // Extract JSON from the response
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let appPreview;
    try {
      appPreview = JSON.parse(jsonStr);
      
      // Normalize screen field names (AI sometimes uses screenName instead of name)
      if (appPreview.screens && Array.isArray(appPreview.screens)) {
        appPreview.screens = appPreview.screens.map((screen: any) => ({
          name: screen.name || screen.screenName || "Screen",
          description: screen.description || "",
          keyElements: screen.keyElements || []
        }));
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Return a structured fallback
      appPreview = {
        appName: "StartupApp",
        tagline: "Your idea, brought to life",
        colorScheme: {
          primary: "#6366f1",
          secondary: "#8b5cf6",
          accent: "#06b6d4"
        },
        screens: [
          { name: "Dashboard", description: "Main overview of your data", keyElements: ["Stats cards", "Activity feed", "Quick actions"] },
          { name: "Profile", description: "User settings and preferences", keyElements: ["Avatar", "Settings", "Subscription"] },
          { name: "Features", description: "Core functionality", keyElements: ["Main tools", "Actions", "Results"] },
          { name: "Analytics", description: "Insights and metrics", keyElements: ["Charts", "Reports", "Trends"] }
        ],
        keyFeatures: [
          { icon: "🚀", title: "Fast Launch", description: "Get started in seconds" },
          { icon: "🔒", title: "Secure", description: "Enterprise-grade security" },
          { icon: "📊", title: "Analytics", description: "Track your progress" },
          { icon: "💰", title: "Monetize", description: "Built-in payment system" }
        ],
        userFlow: "Sign up → Explore features → Use core functionality → Subscribe for premium",
        uniqueSellingPoint: "Simple, powerful, and designed for growth",
        monetizationUI: "Freemium model with clear upgrade prompts"
      };
    }

    console.log('App preview generated:', appPreview.appName);

    return new Response(
      JSON.stringify({ appPreview }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-app-preview function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate app preview';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
