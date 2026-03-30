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
    const { cvBase64, cvText, jobDescription } = await req.json();

    if ((!cvBase64 && !cvText) || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "A CV (PDF or text) and job description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const today = new Date().toISOString().split("T")[0];
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer specializing in the Egyptian job market (Wuzzuf, Bayt, LinkedIn). 

TODAY'S DATE: ${today}. Any dates up to and including today are NOT in the future. Years like 2024, 2025, 2026 are all valid. Do NOT penalize for any dates in the past or present.

Analyze the CV against the job description and return structured results using the provided tool.

IMPORTANT SCORING CALIBRATION:
- A CV that matches 50%+ of job keywords and has relevant experience should score 70+.
- A CV with strong keyword match and relevant skills should score 80+.
- Only score below 50 if the CV is completely unrelated to the job or has severe structural problems.
- Be FAIR and REALISTIC. Focus on actual keyword matches and relevance, not stylistic nitpicking.
- A professionally written CV typically scores between 65-90 against a matching job description.

Scoring weights:
- Keyword match: How many important JD keywords appear in the CV (40% weight)
- Skills alignment: Technical and soft skills match (25% weight)  
- Experience relevance: Role titles, responsibilities, industry match (20% weight)
- Formatting: ATS-friendly structure, no problematic elements (15% weight)

Be specific and actionable in your feedback. Be encouraging while highlighting real improvements.`;

    // Build user message content — supports both PDF (base64) and plain text
    const userContent: any[] = [];

    if (cvBase64) {
      userContent.push({
        type: "file",
        file: {
          filename: "cv.pdf",
          file_data: `data:application/pdf;base64,${cvBase64}`,
        },
      });
      userContent.push({
        type: "text",
        text: `Analyze this uploaded CV PDF against the following job description:\n\n## Job Description:\n${jobDescription}`,
      });
    } else {
      userContent.push({
        type: "text",
        text: `## CV Text:\n${cvText}\n\n## Job Description:\n${jobDescription}`,
      });
    }

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
            { role: "user", content: userContent },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "ats_analysis",
                description:
                  "Return the ATS analysis results for the CV against the job description.",
                parameters: {
                  type: "object",
                  properties: {
                    overallScore: {
                      type: "number",
                      description: "Overall ATS match score from 0 to 100",
                    },
                    keywordMatchPercent: {
                      type: "number",
                      description: "Percentage of JD keywords found in CV (0-100)",
                    },
                    matchedKeywords: {
                      type: "array",
                      items: { type: "string" },
                      description: "Keywords from the JD that were found in the CV",
                    },
                    missingKeywords: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "Important keywords from the JD that are missing from the CV",
                    },
                    formattingIssues: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "ATS formatting problems detected (e.g. tables, images, headers)",
                    },
                    suggestions: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "Actionable suggestions to improve the ATS score",
                    },
                    summary: {
                      type: "string",
                      description:
                        "Brief 2-3 sentence summary of the analysis",
                    },
                  },
                  required: [
                    "overallScore",
                    "keywordMatchPercent",
                    "matchedKeywords",
                    "missingKeywords",
                    "formattingIssues",
                    "suggestions",
                    "summary",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "ats_analysis" },
          },
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
        JSON.stringify({ error: "AI did not return structured analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ats-checker error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
