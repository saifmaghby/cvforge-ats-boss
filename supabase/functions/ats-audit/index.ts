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
    const { cvBase64, cvText } = await req.json();

    if (!cvBase64 && !cvText) {
      return new Response(
        JSON.stringify({ error: "A CV (PDF or text) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) auditor. Perform a GENERAL quality audit of this CV without a specific job description.

Score the CV on these criteria (0-100 each):
- Overall ATS readiness: structure, formatting, parsability
- Content quality: strong action verbs, quantified achievements, clear sections
- Keyword richness: industry-standard terminology, skills density
- Formatting: clean hierarchy, no problematic elements (tables, images, columns)
- Completeness: contact info, summary, experience, education, skills all present

Return a single overall score (weighted average) and categorized feedback using the provided tool.`;

    const userContent: any[] = [];
    if (cvBase64) {
      userContent.push({
        type: "file",
        file: { filename: "cv.pdf", file_data: `data:application/pdf;base64,${cvBase64}` },
      });
      userContent.push({ type: "text", text: "Perform a general ATS quality audit on this CV." });
    } else {
      userContent.push({ type: "text", text: `Perform a general ATS quality audit on this CV:\n\n${cvText}` });
    }

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
        tools: [
          {
            type: "function",
            function: {
              name: "ats_audit",
              description: "Return the general ATS quality audit results.",
              parameters: {
                type: "object",
                properties: {
                  overallScore: { type: "number", description: "Overall ATS readiness score 0-100" },
                  scores: {
                    type: "object",
                    properties: {
                      contentQuality: { type: "number" },
                      keywordRichness: { type: "number" },
                      formatting: { type: "number" },
                      completeness: { type: "number" },
                    },
                    required: ["contentQuality", "keywordRichness", "formatting", "completeness"],
                  },
                  strengths: { type: "array", items: { type: "string" }, description: "Top strengths of the CV" },
                  weaknesses: { type: "array", items: { type: "string" }, description: "Key weaknesses and issues" },
                  suggestions: { type: "array", items: { type: "string" }, description: "Actionable improvements" },
                  summary: { type: "string", description: "Brief 2-3 sentence audit summary" },
                },
                required: ["overallScore", "scores", "strengths", "weaknesses", "suggestions", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "ats_audit" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI audit failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(result));
      return new Response(
        JSON.stringify({ error: "AI did not return structured audit" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audit = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(audit), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ats-audit error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
