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
    const { cvBase64 } = await req.json();

    if (!cvBase64) {
      return new Response(
        JSON.stringify({ error: "A CV PDF is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert CV data extractor. Extract all information from the uploaded CV PDF and return it as structured data using the provided tool.

Rules:
- Extract the person's full name, job title, email, phone, location, and LinkedIn URL from the header/contact section.
- Extract the professional summary or objective statement.
- Extract ALL work experiences with company name, role/title, start date, end date, and bullet points describing achievements.
- Extract ALL education entries with institution, degree, start and end dates.
- Extract ALL skills mentioned anywhere in the CV.
- For dates, use simple formats like "2021", "Jan 2021", or "2021-01".
- If a field is not found, use an empty string.
- For current positions, set current to true and endDate to empty string.
- Each bullet point should be a separate string in the bullets array.`;

    const userContent = [
      {
        type: "file",
        file: {
          filename: "cv.pdf",
          file_data: `data:application/pdf;base64,${cvBase64}`,
        },
      },
      {
        type: "text",
        text: "Extract all CV data from this uploaded PDF document.",
      },
    ];

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
                name: "extract_cv_data",
                description: "Return the extracted CV data in a structured format.",
                parameters: {
                  type: "object",
                  properties: {
                    personal: {
                      type: "object",
                      properties: {
                        fullName: { type: "string", description: "Full name of the person" },
                        title: { type: "string", description: "Job title or professional headline" },
                        email: { type: "string", description: "Email address" },
                        phone: { type: "string", description: "Phone number" },
                        location: { type: "string", description: "City, country or address" },
                        linkedin: { type: "string", description: "LinkedIn profile URL" },
                      },
                      required: ["fullName", "title", "email", "phone", "location", "linkedin"],
                      additionalProperties: false,
                    },
                    summary: { type: "string", description: "Professional summary or objective" },
                    experience: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          company: { type: "string" },
                          role: { type: "string" },
                          startDate: { type: "string" },
                          endDate: { type: "string" },
                          current: { type: "boolean" },
                          bullets: { type: "array", items: { type: "string" } },
                        },
                        required: ["company", "role", "startDate", "endDate", "current", "bullets"],
                        additionalProperties: false,
                      },
                    },
                    education: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          institution: { type: "string" },
                          degree: { type: "string" },
                          startDate: { type: "string" },
                          endDate: { type: "string" },
                        },
                        required: ["institution", "degree", "startDate", "endDate"],
                        additionalProperties: false,
                      },
                    },
                    skills: {
                      type: "array",
                      items: { type: "string" },
                      description: "List of skills found in the CV",
                    },
                  },
                  required: ["personal", "summary", "experience", "education", "skills"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "extract_cv_data" },
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
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI extraction failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(result));
      return new Response(
        JSON.stringify({ error: "AI did not return structured data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-cv error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
