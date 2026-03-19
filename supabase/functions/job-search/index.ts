import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { cvData } = await req.json();
    if (!cvData) {
      return new Response(JSON.stringify({ error: "CV data is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a job search expert for the MENA region. Given a user's CV data, generate optimized search queries and direct links to major job boards.

Return structured data using the provided tool. For each job board, generate 3-5 search queries optimized for that platform's search engine.

Job boards to target:
1. Wuzzuf (wuzzuf.net) - Egypt's top job board. Search URL format: https://wuzzuf.net/search/jobs/?q={query}&a=hpb
2. LinkedIn Jobs - Global. Search URL format: https://www.linkedin.com/jobs/search/?keywords={query}&location={location}
3. Bayt (bayt.com) - MENA region. Search URL format: https://www.bayt.com/en/international/jobs/{query}-jobs/

Rules:
- Generate queries based on the person's job title, skills, and experience level.
- Make queries specific enough to find relevant jobs but broad enough to return results.
- URL-encode query parameters properly.
- Include the user's location in LinkedIn searches.
- For each query, provide a human-readable label describing what it searches for.
- Also suggest a "recommended role title" based on the CV.`;

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
          { role: "user", content: `Here is my CV data:\n${JSON.stringify(cvData, null, 2)}\n\nGenerate optimized job search links for me.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_job_search_links",
              description: "Return job search queries and links for multiple job boards.",
              parameters: {
                type: "object",
                properties: {
                  recommendedTitle: { type: "string", description: "Recommended job title based on CV" },
                  summary: { type: "string", description: "Brief summary of the job search strategy" },
                  boards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Job board name (Wuzzuf, LinkedIn, Bayt)" },
                        icon: { type: "string", description: "Emoji icon for the board" },
                        queries: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              label: { type: "string", description: "Human-readable search description" },
                              url: { type: "string", description: "Full search URL" },
                            },
                            required: ["label", "url"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["name", "icon", "queries"],
                      additionalProperties: false,
                    },
                  },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                    description: "Job search tips based on the CV",
                  },
                },
                required: ["recommendedTitle", "summary", "boards", "tips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_job_search_links" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI search generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(result));
      return new Response(JSON.stringify({ error: "AI did not return structured data" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("job-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
