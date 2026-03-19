import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, context, recipientName, companyName, roleName, interviewDate, customDetails } = await req.json();

    if (!type || !companyName || !roleName) {
      return new Response(
        JSON.stringify({ error: "Email type, company, and role are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const typeDescriptions: Record<string, string> = {
      "post-interview": "A follow-up email sent 24 hours after a job interview. Thank the interviewer, reference specific topics discussed, reaffirm interest.",
      "post-application": "A follow-up email sent 1-2 weeks after submitting a job application to check status and reaffirm interest.",
      "networking": "A follow-up after a networking event or informational interview. Reference the conversation, express interest in staying connected.",
      "post-offer": "A professional response to a job offer, either accepting, requesting time to consider, or negotiating terms.",
      "rejection-response": "A gracious response to a job rejection, expressing gratitude and keeping the door open for future opportunities.",
    };

    const systemPrompt = `You are an expert career coach specializing in professional email communication for the MENA/Egyptian job market.

Generate a professional follow-up email based on the given context. The email should be:
- Concise (150-250 words max)
- Professional yet warm
- Specific (reference actual details when provided)
- Include a clear call-to-action
- Appropriate timing recommendation

Type: ${typeDescriptions[type] || type}`;

    const userContent = `Generate a follow-up email with these details:
- Type: ${type}
- Company: ${companyName}
- Role: ${roleName}
${recipientName ? `- Recipient: ${recipientName}` : ""}
${interviewDate ? `- Interview/Event Date: ${interviewDate}` : ""}
${context ? `- Additional Context: ${context}` : ""}
${customDetails ? `- Custom Details: ${customDetails}` : ""}`;

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
            name: "follow_up_email",
            description: "Return the generated follow-up email.",
            parameters: {
              type: "object",
              properties: {
                subject: { type: "string", description: "Email subject line" },
                body: { type: "string", description: "Full email body text" },
                timing: { type: "string", description: "Recommended timing to send (e.g., 'Send within 24 hours of the interview')" },
                tips: { type: "array", items: { type: "string" }, description: "2-3 tips for this type of email" },
                alternativeSubjects: { type: "array", items: { type: "string" }, description: "2 alternative subject lines" },
              },
              required: ["subject", "body", "timing", "tips", "alternativeSubjects"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "follow_up_email" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI did not return structured data" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(toolCall.function.arguments, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("follow-up-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
