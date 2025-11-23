import { generateObject } from "ai";
import { z } from "zod";

const keywordSchema = z.object({
  keywords: z.array(z.string()).min(1).max(10),
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Query string is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await generateObject({
      model: "openai/gpt-5.1-instant",
      schema: keywordSchema,
      prompt: `Extract 3-5 relevant search keywords from this user query about code snippets. Focus on:
- Programming languages (e.g., python, javascript, typescript)
- Technologies/frameworks (e.g., react, postgres, docker)
- Concepts/patterns (e.g., authentication, api, database)
- Key descriptive words from the query (e.g., helper, utility, function)

Important: Extract keywords that are likely to appear in snippet TITLES, TAGS, or CONTENT. 
If the query mentions "auth helper" or "authentication helper", extract keywords like: ["auth", "authentication", "helper"]
If the query mentions "python postgres", extract: ["python", "postgres", "database"]

User query: "${query}"

Return only the most relevant keywords that would help find matching code snippets. Keep keywords concise and match common naming patterns.`,
    });

    return new Response(JSON.stringify({ keywords: result.object.keywords }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Keyword extraction error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to extract keywords" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
