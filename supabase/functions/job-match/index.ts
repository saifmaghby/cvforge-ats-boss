import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { cvData, jobDescription } = await req.json();

    if (!cvData || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "CV data and job description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert job matching analyst for the MENA/Egyptian market. Analyze how well a candidate's CV matches a specific job description.

Provide:
- A match score (0-100)
- Breakdown by categories (skills match, experience match, education match, keywords)
- Specific gaps the candidate has
- Concrete suggestions to tailor their CV for this specific role
- Which existing CV content to emphasize and which to downplay

Be specific and reference actual content from both the CV and JD.`;

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
          { role: "user", content: `## CV Data:\n${JSON.stringify(cvData, null, 2)}\n\n## Job Description:\n${jobDescription}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "job_match_analysis",
            description: "Return job match analysis results.",
            parameters: {
              type: "object",
              properties: {
                matchScore: { type: "number", description: "Overall match score 0-100" },
                verdict: { type: "string", description: "One-line verdict: Strong Match, Moderate Match, Weak Match, or Poor Match" },
                scores: {
                  type: "object",
                  properties: {
                    skillsMatch: { type: "number" },
                    experienceMatch: { type: "number" },
                    educationMatch: { type: "number" },
                    keywordsMatch: { type: "number" },
                  },
                  required: ["skillsMatch", "experienceMatch", "educationMatch", "keywordsMatch"],
                },
                matchedSkills: { type: "array", items: { type: "string" }, description: "Skills that match between CV and JD" },
                missingSkills: { type: "array", items: { type: "string" }, description: "Skills required by JD but missing from CV" },
                gaps: { type: "array", items: { type: "string" }, description: "Key gaps between CV and JD requirements" },
                emphasize: { type: "array", items: { type: "string" }, description: "Existing CV content to highlight/emphasize" },
                suggestions: { type: "array", items: { type: "string" }, description: "Specific edits to make the CV better match this role" },
                summary: { type: "string", description: "2-3 sentence summary of the match analysis" },
              },
              required: ["matchScore", "verdict", "scores", "matchedSkills", "missingSkills", "gaps", "emphasize", "suggestions", "summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "job_match_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI did not return structured data" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(toolCall.function.arguments, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("job-match error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
