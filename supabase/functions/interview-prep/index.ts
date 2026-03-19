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
    const { action, cvData, jobDescription, question, answer, questions } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (action === "generate") {
      if (!jobDescription) {
        return new Response(
          JSON.stringify({ error: "Job description is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cvText = cvData
        ? `
Name: ${cvData.personal?.fullName || ""}
Title: ${cvData.personal?.title || ""}
Summary: ${cvData.summary || ""}
Skills: ${(cvData.skills || []).join(", ")}
Experience: ${(cvData.experience || []).map((e: any) => `${e.role} at ${e.company}: ${e.bullets?.join("; ")}`).join(" | ")}
Education: ${(cvData.education || []).map((e: any) => `${e.degree} at ${e.institution}`).join(" | ")}
`.trim()
        : "";

      const systemPrompt = `You are an expert interview coach. Generate exactly 8 interview questions tailored to the job description${cvText ? " and the candidate's CV" : ""}.

Include a mix of:
- 2 behavioral questions (STAR format)
- 2 technical/role-specific questions
- 2 situational questions
- 1 culture-fit question
- 1 challenging/curveball question

For each question, provide:
1. The question text
2. The category (behavioral, technical, situational, culture-fit, curveball)
3. A brief tip on how to approach answering it (2-3 sentences)

You MUST respond by calling the provided tool.`;

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
            { role: "user", content: `## Job Description:\n${jobDescription}${cvText ? `\n\n## Candidate CV:\n${cvText}` : ""}` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_questions",
              description: "Return structured interview questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        category: { type: "string", enum: ["behavioral", "technical", "situational", "culture-fit", "curveball"] },
                        tip: { type: "string" },
                      },
                      required: ["question", "category", "tip"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "return_questions" } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const t = await response.text();
        console.error("AI error:", response.status, t);
        return new Response(JSON.stringify({ error: "AI generation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const result = await response.json();
      const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
      const parsed = JSON.parse(toolCall?.function?.arguments || "{}");

      return new Response(JSON.stringify({ questions: parsed.questions || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "evaluate") {
      if (!question || !answer) {
        return new Response(
          JSON.stringify({ error: "Question and answer are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const systemPrompt = `You are a senior interview coach providing feedback on interview answers.

Evaluate the candidate's answer to the given interview question. Provide:
1. A score from 1-10
2. Strengths of the answer (2-3 bullet points)
3. Areas for improvement (2-3 bullet points)  
4. A model answer suggestion (3-4 sentences)

Be constructive, specific, and encouraging. Reference the STAR method for behavioral questions.

You MUST respond by calling the provided tool.`;

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
            { role: "user", content: `## Interview Question:\n${question}\n\n## Candidate's Answer:\n${answer}` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_feedback",
              description: "Return structured feedback on the answer",
              parameters: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  strengths: { type: "array", items: { type: "string" } },
                  improvements: { type: "array", items: { type: "string" } },
                  modelAnswer: { type: "string" },
                },
                required: ["score", "strengths", "improvements", "modelAnswer"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "return_feedback" } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const t = await response.text();
        console.error("AI error:", response.status, t);
        return new Response(JSON.stringify({ error: "AI evaluation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const result = await response.json();
      const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
      const parsed = JSON.parse(toolCall?.function?.arguments || "{}");

      return new Response(JSON.stringify({ feedback: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("interview-prep error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
