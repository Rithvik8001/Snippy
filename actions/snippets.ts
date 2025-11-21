"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";
import db from "@/db/config";
import { snippets } from "@/db/models";
import { eq, and } from "drizzle-orm";
import {
  createSnippetSchema,
  type CreateSnippetInput,
  updateSnippetSchema,
  type UpdateSnippetInput,
} from "@/validations/snippets";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  handleError,
  success,
  ValidationError,
  DatabaseError,
  AuthenticationError,
  NotFoundError,
} from "@/lib/errors";

export async function createSnippet(data: CreateSnippetInput) {
  try {
    let validatedData: CreateSnippetInput;
    try {
      validatedData = createSnippetSchema.parse(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new ValidationError(
          "Please check your input and try again",
          err.issues.map((e) => ({
            path: e.path.map(String),
            message: e.message,
          }))
        );
      }
      throw err;
    }

    let userId: string;
    try {
      userId = await getCurrentUserId();
    } catch {
      throw new AuthenticationError("You must be logged in to create snippets");
    }

    const id = nanoid();

    const snippetData = {
      id,
      userId,
      type: validatedData.type,
      title: validatedData.title.trim(),
      tags: (validatedData.tags || []).filter(
        (tag: string) => tag.trim().length > 0
      ),
      isFavorite: false,
      useCount: 0,
      ...(validatedData.type === "code" && {
        content: validatedData.content.trim(),
        language: validatedData.language?.trim() || null,
        framework: validatedData.framework?.trim() || null,
        command: null,
      }),
      ...(validatedData.type === "text" && {
        content: validatedData.content.trim(),
        language: null,
        framework: null,
        command: null,
      }),
      ...(validatedData.type === "command" && {
        command: validatedData.command.trim(),
        content: null,
        language: null,
        framework: null,
      }),
    };
    try {
      await db.insert(snippets).values(snippetData);
    } catch (dbError) {
      console.error("Database insert error:", dbError);

      if (dbError && typeof dbError === "object") {
        const errorMessage = String(dbError);

        if (
          errorMessage.includes("unique") ||
          errorMessage.includes("duplicate")
        ) {
          throw new DatabaseError(
            "A snippet with this ID already exists. Please try again.",
            dbError
          );
        }
        if (
          errorMessage.includes("foreign key") ||
          errorMessage.includes("constraint")
        ) {
          throw new DatabaseError(
            "Invalid data provided. Please check your input.",
            dbError
          );
        }
      }
      throw new DatabaseError(
        "Failed to save snippet. Please try again.",
        dbError
      );
    }
    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/snippets");
    } catch (revalidateError) {
      console.warn("Failed to revalidate paths:", revalidateError);
    }

    return success({ id });
  } catch (err) {
    return handleError(err);
  }
}

export async function updateSnippet(data: UpdateSnippetInput) {
  try {
    let validatedData: UpdateSnippetInput;
    try {
      validatedData = updateSnippetSchema.parse(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new ValidationError(
          "Please check your input and try again",
          err.issues.map((e) => ({
            path: e.path.map(String),
            message: e.message,
          }))
        );
      }
      throw err;
    }

    let userId: string;
    try {
      userId = await getCurrentUserId();
    } catch {
      throw new AuthenticationError("You must be logged in to update snippets");
    }

    // Check if snippet exists and belongs to user
    const existingSnippet = await db
      .select()
      .from(snippets)
      .where(
        and(eq(snippets.id, validatedData.id), eq(snippets.userId, userId))
      )
      .limit(1)
      .then((results) => results[0] || null);

    if (!existingSnippet) {
      throw new NotFoundError(
        "Snippet not found or you don't have permission to update it"
      );
    }

    const updateData = {
      type: validatedData.type,
      title: validatedData.title.trim(),
      tags: (validatedData.tags || []).filter(
        (tag: string) => tag.trim().length > 0
      ),
      updatedAt: new Date(),
      ...(validatedData.type === "code" && {
        content: validatedData.content.trim(),
        language: validatedData.language?.trim() || null,
        framework: validatedData.framework?.trim() || null,
        command: null,
      }),
      ...(validatedData.type === "text" && {
        content: validatedData.content.trim(),
        language: null,
        framework: null,
        command: null,
      }),
      ...(validatedData.type === "command" && {
        command: validatedData.command.trim(),
        content: null,
        language: null,
        framework: null,
      }),
    };

    try {
      await db
        .update(snippets)
        .set(updateData)
        .where(
          and(eq(snippets.id, validatedData.id), eq(snippets.userId, userId))
        );
    } catch (dbError) {
      console.error("Database update error:", dbError);
      throw new DatabaseError(
        "Failed to update snippet. Please try again.",
        dbError
      );
    }

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/snippets");
      revalidatePath(`/dashboard/snippets/${validatedData.id}`);
    } catch (revalidateError) {
      console.warn("Failed to revalidate paths:", revalidateError);
    }

    return success({ id: validatedData.id });
  } catch (err) {
    return handleError(err);
  }
}

export async function deleteSnippet(snippetId: string) {
  try {
    let userId: string;
    try {
      userId = await getCurrentUserId();
    } catch {
      throw new AuthenticationError("You must be logged in to delete snippets");
    }

    // Check if snippet exists and belongs to user
    const existingSnippet = await db
      .select()
      .from(snippets)
      .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
      .limit(1)
      .then((results) => results[0] || null);

    if (!existingSnippet) {
      throw new NotFoundError(
        "Snippet not found or you don't have permission to delete it"
      );
    }

    try {
      await db
        .delete(snippets)
        .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)));
    } catch (dbError) {
      console.error("Database delete error:", dbError);
      throw new DatabaseError(
        "Failed to delete snippet. Please try again.",
        dbError
      );
    }

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/snippets");
    } catch (revalidateError) {
      console.warn("Failed to revalidate paths:", revalidateError);
    }

    return success({ id: snippetId });
  } catch (err) {
    return handleError(err);
  }
}

export async function copySnippet(snippetId: string) {
  try {
    let userId: string;
    try {
      userId = await getCurrentUserId();
    } catch {
      // Silently fail if not authenticated - copy still works
      return success({ id: snippetId });
    }

    try {
      // First get current use count
      const currentSnippet = await db
        .select({ useCount: snippets.useCount })
        .from(snippets)
        .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
        .limit(1)
        .then((results) => results[0]);

      if (currentSnippet) {
        await db
          .update(snippets)
          .set({
            useCount: currentSnippet.useCount + 1,
            lastUsedAt: new Date(),
          })
          .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)));
      }
    } catch (dbError) {
      // Silently fail - copy still works even if tracking fails
      console.warn("Failed to update use count:", dbError);
    }

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/snippets");
      revalidatePath(`/dashboard/snippets/${snippetId}`);
    } catch (revalidateError) {
      console.warn("Failed to revalidate paths:", revalidateError);
    }

    return success({ id: snippetId });
  } catch {
    // Silently fail - copy still works
    return success({ id: snippetId });
  }
}

export async function toggleFavorite(snippetId: string) {
  try {
    let userId: string;
    try {
      userId = await getCurrentUserId();
    } catch {
      throw new AuthenticationError("You must be logged in to toggle favorites");
    }

    // Check if snippet exists and belongs to user
    const existingSnippet = await db
      .select({ isFavorite: snippets.isFavorite })
      .from(snippets)
      .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)))
      .limit(1)
      .then((results) => results[0] || null);

    if (!existingSnippet) {
      throw new NotFoundError("Snippet not found or you don't have permission to modify it");
    }

    try {
      await db
        .update(snippets)
        .set({
          isFavorite: !existingSnippet.isFavorite,
          updatedAt: new Date(),
        })
        .where(and(eq(snippets.id, snippetId), eq(snippets.userId, userId)));
    } catch (dbError) {
      console.error("Database update error:", dbError);
      throw new DatabaseError(
        "Failed to update favorite status. Please try again.",
        dbError
      );
    }

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/snippets");
      revalidatePath(`/dashboard/snippets/${snippetId}`);
    } catch (revalidateError) {
      console.warn("Failed to revalidate paths:", revalidateError);
    }

    return success({ id: snippetId, isFavorite: !existingSnippet.isFavorite });
  } catch (err) {
    return handleError(err);
  }
}
