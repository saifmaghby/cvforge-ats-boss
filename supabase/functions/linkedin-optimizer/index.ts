import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { cvData, targetRole, currentHeadline, currentSummary } = await req.json();

    if (!cvData) {
      return new Response(
        JSON.stringify({ error: "CV data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert LinkedIn profile optimizer specializing in the MENA/Egyptian job market. Given a user's CV data and optionally their current LinkedIn headline/summary, generate optimized LinkedIn sections.

Focus on:
- SEO-friendly headline with relevant keywords (max 220 chars)
- Compelling About section (summary) that tells a story and includes keywords
- Optimized Experience bullet points with metrics and achievements
- Skills list ordered by relevance to target role
- Headline should avoid generic titles; be specific and keyword-rich

If a target role is provided, tailor everything toward that role. Be specific and actionable.`;

    const userContent = `## CV Data:
${JSON.stringify(cvData, null, 2)}

${targetRole ? `## Target Role: ${targetRole}` : ""}
${currentHeadline ? `## Current LinkedIn Headline: ${currentHeadline}` : ""}
${currentSummary ? `## Current LinkedIn Summary: ${currentSummary}` : ""}

Optimize this person's LinkedIn profile sections.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [{
          type: "function",
          function: {
            name: "linkedin_optimization",
            description: "Return optimized LinkedIn profile sections.",
            parameters: {
              type: "object",
              properties: {
                headline: { type: "string", description: "Optimized LinkedIn headline (max 220 chars)" },
                headlineAlternatives: { type: "array", items: { type: "string" }, description: "2-3 alternative headline options" },
                about: { type: "string", description: "Optimized LinkedIn About/Summary section (300-500 words)" },
                experienceEntries: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      company: { type: "string" },
                      role: { type: "string" },
                      bullets: { type: "array", items: { type: "string" } },
                    },
                    required: ["company", "role", "bullets"],
                  },
                  description: "Optimized experience entries",
                },
                topSkills: { type: "array", items: { type: "string" }, description: "Top 15 skills ordered by relevance" },
                keywordsToAdd: { type: "array", items: { type: "string" }, description: "Keywords missing from profile that recruiters search for" },
                tips: { type: "array", items: { type: "string" }, description: "3-5 actionable tips for profile improvement" },
              },
              required: ["headline", "headlineAlternatives", "about", "experienceEntries", "topSkills", "keywordsToAdd", "tips"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "linkedin_optimization" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI optimization failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI did not return structured data" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(toolCall.function.arguments, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("linkedin-optimizer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
