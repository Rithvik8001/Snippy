"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";
import db from "@/db/config";
import { snippets } from "@/db/models";
import { nanoid } from "nanoid";
import {
  parseJsonImport,
  parseCsvImport,
  validateImportSnippets,
  convertToCreateInput,
  type ImportValidationResult,
} from "@/lib/import/snippets-import";
import { createSnippet } from "./snippets";
import { handleError, success } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    title?: string;
    errors: string[];
  }>;
}

export async function importSnippetsFromFile(
  fileContent: string,
  fileType: "json" | "csv"
): Promise<ActionResult<ImportResult>> {
  try {
    const userId = await getCurrentUserId();

    // Parse file based on type
    let importSnippets: Array<{
      type: "code" | "text" | "command";
      title: string;
      tags: string[];
      content?: string;
      command?: string;
      language?: string;
      framework?: string;
      isFavorite?: boolean;
      useCount?: number;
    }>;

    try {
      if (fileType === "json") {
        const parsed = parseJsonImport(fileContent);
        importSnippets = parsed.snippets;
      } else {
        importSnippets = parseCsvImport(fileContent);
      }
    } catch (error) {
      return handleError(
        error,
        `Failed to parse ${fileType.toUpperCase()} file. Please check the file format.`
      );
    }

    if (importSnippets.length === 0) {
      return handleError(
        new Error("No snippets found in file"),
        "The file does not contain any snippets."
      );
    }

    // Validate snippets
    const validation = validateImportSnippets(importSnippets);

    if (validation.valid.length === 0) {
      return handleError(
        new Error("No valid snippets found"),
        "All snippets in the file are invalid. Please check the file format."
      );
    }

    // Import valid snippets
    const results: ImportResult = {
      total: importSnippets.length,
      successful: 0,
      failed: validation.invalid.length,
      errors: validation.invalid.map((item) => ({
        index: item.index,
        title: (item.data as { title?: string }).title,
        errors: item.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      })),
    };

    // Create snippets in batches
    for (const snippet of validation.valid) {
      const createInput = convertToCreateInput(snippet);
      const result = await createSnippet(createInput);

      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({
          index: -1, // Unknown index for creation errors
          title: snippet.title,
          errors: [result.error || "Unknown error"],
        });
      }
    }

    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/snippets");

    return success(results);
  } catch (error) {
    return handleError(error, "Failed to import snippets");
  }
}

