"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";
import db from "@/db/config";
import { snippets } from "@/db/models";
import {
  createSnippetSchema,
  type CreateSnippetInput,
} from "@/validations/snippets";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  handleError,
  success,
  ValidationError,
  DatabaseError,
  AuthenticationError,
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
      tags: (validatedData.tags || []).filter((tag) => tag.trim().length > 0),
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
