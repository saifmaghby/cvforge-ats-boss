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
    const { cvData, jobDescription, companyName, tone } = await req.json();

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
Email: ${cvData.personal?.email || ""}
Phone: ${cvData.personal?.phone || ""}
Location: ${cvData.personal?.location || ""}
Summary: ${cvData.summary || ""}
Skills: ${(cvData.skills || []).join(", ")}
Experience: ${(cvData.experience || []).map((e: any) => `${e.role} at ${e.company} (${e.startDate}–${e.current ? "Present" : e.endDate}): ${e.bullets?.join("; ")}`).join(" | ")}
Education: ${(cvData.education || []).map((e: any) => `${e.degree} at ${e.institution} (${e.startDate}–${e.endDate})`).join(" | ")}
`.trim();

    const toneInstruction = tone === "confident" 
      ? "Use a confident, assertive tone that highlights accomplishments boldly."
      : tone === "formal"
      ? "Use a formal, traditional tone appropriate for corporate environments."
      : tone === "conversational"
      ? "Use a warm, conversational tone while remaining professional."
      : "Use a professional, balanced tone.";

    const systemPrompt = `You are an expert cover letter writer specializing in the Egyptian and MENA job market.

Write a compelling, tailored cover letter based on the candidate's CV and the target job description.

Rules:
- ${toneInstruction}
- Address the specific requirements mentioned in the job description
- Reference concrete achievements from the CV that align with the role
- Keep it concise: 3-4 paragraphs, under 400 words
- Do NOT use generic filler — every sentence must add value
- ${companyName ? `Address the letter to ${companyName}` : "Use a professional greeting"}
- Include a strong opening hook and a clear call-to-action closing
- Make it ATS-friendly with natural keyword integration from the JD
- Return ONLY the cover letter text, no additional commentary`;

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
            {
              role: "user",
              content: `## Candidate CV:\n${cvText}\n\n## Target Job Description:\n${jobDescription}`,
            },
          ],
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
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const coverLetter = result.choices?.[0]?.message?.content;

    if (!coverLetter) {
      return new Response(
        JSON.stringify({ error: "AI did not return a cover letter" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ coverLetter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-cover-letter error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
