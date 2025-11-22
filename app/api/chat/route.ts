import { streamText, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = streamText({
      model: "openai/gpt-5.1-instant",
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
