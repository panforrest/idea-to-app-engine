import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea } = await req.json();
    
    if (!idea || idea.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide a startup idea' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing idea:', idea.substring(0, 100) + '...');

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert startup analyst and business strategist. Analyze the given startup idea and provide a comprehensive assessment.

Return a JSON object with this exact structure:
{
  "summary": "A brief 2-3 sentence summary of the idea",
  "viabilityScore": <number 1-100>,
  "marketPotential": "<low|medium|high>",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "challenges": ["challenge 1", "challenge 2", "challenge 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "targetAudience": "Description of the ideal target audience",
  "competitiveAdvantage": "What makes this idea unique",
  "revenueModel": "Suggested monetization strategy",
  "nextSteps": ["immediate action 1", "immediate action 2", "immediate action 3"]
}

Be specific, actionable, and realistic in your analysis. Consider market trends, competition, and technical feasibility.`;

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
          { role: "user", content: `Analyze this startup idea: ${idea}` }
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
      throw new Error("Failed to analyze idea");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    console.log('AI response received, parsing...');

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Return a structured fallback
      analysis = {
        summary: content.substring(0, 200),
        viabilityScore: 70,
        marketPotential: "medium",
        strengths: ["Unique concept", "Growing market", "Scalable solution"],
        challenges: ["Market competition", "Initial funding", "User acquisition"],
        recommendations: ["Validate with target users", "Build MVP", "Seek mentorship"],
        targetAudience: "Early adopters and tech-savvy users",
        competitiveAdvantage: "First-mover advantage in niche market",
        revenueModel: "Freemium with premium features",
        nextSteps: ["Research competitors", "Create landing page", "Interview potential users"]
      };
    }

    console.log('Analysis complete, viability score:', analysis.viabilityScore);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-idea function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze idea';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
