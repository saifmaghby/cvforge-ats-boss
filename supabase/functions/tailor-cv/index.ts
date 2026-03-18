import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { cvData, jobDescription } = await req.json();

    if (!cvData || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Both cvData and jobDescription are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const cvText = `
Name: ${cvData.personal?.fullName || ""}
Title: ${cvData.personal?.title || ""}
Summary: ${cvData.summary || ""}
Skills: ${(cvData.skills || []).join(", ")}
Experience: ${(cvData.experience || []).map((e: any) => `${e.role} at ${e.company}: ${e.bullets?.join("; ")}`).join(" | ")}
Education: ${(cvData.education || []).map((e: any) => `${e.degree} at ${e.institution}`).join(" | ")}
`.trim();

    const systemPrompt = `You are an expert CV optimization consultant specializing in the Egyptian job market (Wuzzuf, Bayt, LinkedIn).

Analyze the CV against the job description and suggest specific, actionable improvements using the provided tool. Focus on:
1. Missing keywords that should be added to skills
2. Suggested rewrites for the summary to better match the JD
3. Bullet point improvements for experience entries
4. Overall tailoring tips

Be specific — reference actual phrases from the JD. Keep suggestions practical and ATS-friendly.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `## Current CV:\n${cvText}\n\n## Target Job Description:\n${jobDescription}` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "cv_tailoring",
                description: "Return tailoring suggestions for the CV based on the job description.",
                parameters: {
                  type: "object",
                  properties: {
                    missingSkills: {
                      type: "array",
                      items: { type: "string" },
                      description: "Skills/keywords from the JD missing from the CV that should be added",
                    },
                    suggestedSummary: {
                      type: "string",
                      description: "A rewritten professional summary tailored to the JD",
                    },
                    bulletImprovements: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          original: { type: "string", description: "The original bullet text" },
                          improved: { type: "string", description: "The improved bullet text incorporating JD keywords" },
                        },
                        required: ["original", "improved"],
                        additionalProperties: false,
                      },
                      description: "Suggested improvements for existing experience bullets",
                    },
                    titleSuggestion: {
                      type: "string",
                      description: "Suggested job title that better matches the JD, or empty if current is fine",
                    },
                    tips: {
                      type: "array",
                      items: { type: "string" },
                      description: "General tips for tailoring this CV to the role",
                    },
                  },
                  required: ["missingSkills", "suggestedSummary", "bulletImprovements", "titleSuggestion", "tips"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "cv_tailoring" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(result));
      return new Response(
        JSON.stringify({ error: "AI did not return structured suggestions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const suggestions = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tailor-cv error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
