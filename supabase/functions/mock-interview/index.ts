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
    const { action, jobDescription, cvData, messages, interviewType, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Action: start - Generate interviewer persona and first question
    if (action === "start") {
      if (!jobDescription) {
        return new Response(
          JSON.stringify({ error: "Job description is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cvText = cvData
        ? `\nCandidate CV:\nName: ${cvData.personal?.fullName || ""}\nTitle: ${cvData.personal?.title || ""}\nSummary: ${cvData.summary || ""}\nSkills: ${(cvData.skills || []).join(", ")}\nExperience: ${(cvData.experience || []).map((e: any) => `${e.role} at ${e.company}`).join(" | ")}`
        : "";

      const langInstruction = language === "arabic" 
        ? "Conduct the interview primarily in Arabic (Egyptian dialect when appropriate), but technical terms can be in English."
        : "Conduct the interview in English.";

      const typeInstruction = interviewType === "technical" 
        ? "Focus heavily on technical questions, coding scenarios, system design, and problem-solving."
        : interviewType === "behavioral"
        ? "Focus on behavioral questions using the STAR method, teamwork, leadership, and conflict resolution."
        : interviewType === "hr"
        ? "Focus on HR-style questions: salary expectations, career goals, strengths/weaknesses, cultural fit, and workplace scenarios."
        : "Mix behavioral, technical, and HR questions naturally.";

      const systemPrompt = `You are an experienced interviewer at a top company in the MENA region (Egypt/Gulf). You are conducting a realistic job interview.

${langInstruction}
${typeInstruction}

Job Description:
${jobDescription}
${cvText}

INTERVIEW RULES:
1. Start with a warm professional greeting and introduce yourself briefly (make up a realistic name and title)
2. Ask ONE question at a time - never multiple questions
3. After the candidate answers, provide brief acknowledgment, then ask the next question
4. Include questions commonly asked in Egyptian/MENA interviews (e.g., military service status for males, availability to travel, family status expectations, willingness to relocate within Gulf countries)
5. Be professional but natural - use conversational language
6. After 6-8 questions, wrap up the interview naturally
7. When wrapping up, ask "Do you have any questions for us?"
8. Keep responses concise - this is a conversation, not a lecture

IMPORTANT: Stay in character as the interviewer throughout. Do NOT break character or provide tips/coaching during the interview.`;

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
            { role: "user", content: "Please begin the interview." },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const t = await response.text();
        console.error("AI error:", response.status, t);
        return new Response(JSON.stringify({ error: "AI generation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Action: respond - Continue the conversation
    if (action === "respond") {
      if (!messages || !Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: "Messages array is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const t = await response.text();
        console.error("AI error:", response.status, t);
        return new Response(JSON.stringify({ error: "AI response failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Action: evaluate - Get final interview report
    if (action === "evaluate") {
      if (!messages || !Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: "Messages array is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const evalPrompt = `Based on the interview conversation above, provide a comprehensive performance evaluation.

You MUST respond by calling the provided tool.`;

      const evalMessages = [
        ...messages,
        { role: "user", content: evalPrompt },
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: evalMessages,
          tools: [{
            type: "function",
            function: {
              name: "return_evaluation",
              description: "Return structured interview evaluation",
              parameters: {
                type: "object",
                properties: {
                  overallScore: { type: "number", description: "Score out of 100" },
                  communicationScore: { type: "number", description: "Score out of 100" },
                  technicalScore: { type: "number", description: "Score out of 100" },
                  confidenceScore: { type: "number", description: "Score out of 100" },
                  topStrengths: { type: "array", items: { type: "string" }, description: "Top 3 strengths" },
                  areasToImprove: { type: "array", items: { type: "string" }, description: "Top 3 areas to improve" },
                  detailedFeedback: { type: "string", description: "2-3 paragraphs of detailed coaching feedback" },
                  hireRecommendation: { type: "string", enum: ["Strong Hire", "Hire", "Leaning Hire", "Leaning No Hire", "No Hire"] },
                },
                required: ["overallScore", "communicationScore", "technicalScore", "confidenceScore", "topStrengths", "areasToImprove", "detailedFeedback", "hireRecommendation"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "return_evaluation" } },
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

      return new Response(JSON.stringify({ evaluation: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mock-interview error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
