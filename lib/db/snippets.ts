import db from "@/db/config";
import { snippets } from "@/db/models";
import { eq, desc, and } from "drizzle-orm";

async function safeDbQuery<T>(
  queryFn: () => Promise<T>,
  defaultValue: T
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    // Log error for debugging but don't expose to user
    if (process.env.NODE_ENV === "development") {
      console.error("Database query error:", error);
    }
    return defaultValue;
  }
}

export async function getSnippetsByUserId(userId: string) {
  return safeDbQuery(
    () => db.select().from(snippets).where(eq(snippets.userId, userId)),
    []
  );
}

export async function getSnippetsByUserIdAndType(
  userId: string,
  type: "code" | "text" | "command"
) {
  return safeDbQuery(
    () =>
      db
        .select()
        .from(snippets)
        .where(and(eq(snippets.userId, userId), eq(snippets.type, type))),
    []
  );
}

export async function getFavoriteSnippets(userId: string) {
  return safeDbQuery(
    () =>
      db
        .select()
        .from(snippets)
        .where(and(eq(snippets.userId, userId), eq(snippets.isFavorite, true))),
    []
  );
}

export async function getRecentSnippets(userId: string, limit = 5) {
  return safeDbQuery(
    () =>
      db
        .select()
        .from(snippets)
        .where(eq(snippets.userId, userId))
        .orderBy(desc(snippets.updatedAt))
        .limit(limit),
    []
  );
}

export async function getSnippetById(userId: string, snippetId: string) {
  return safeDbQuery(
    () =>
      db
        .select()
        .from(snippets)
        .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
        .limit(1)
        .then((results) => results[0] || null),
    null
  );
}

export async function getSnippetStats(userId: string) {
  const allSnippets = await getSnippetsByUserId(userId);

  return {
    total: allSnippets.length,
    favorites: allSnippets.filter((s) => s.isFavorite).length,
    code: allSnippets.filter((s) => s.type === "code").length,
    text: allSnippets.filter((s) => s.type === "text").length,
    command: allSnippets.filter((s) => s.type === "command").length,
    totalUses: allSnippets.reduce((sum, s) => sum + s.useCount, 0),
  };
}
