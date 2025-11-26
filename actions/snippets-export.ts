"use server";

import { getCurrentUserId } from "@/lib/auth";
import {
  getSnippetsByUserId,
  getSnippetsByUserIdAndType,
  getFavoriteSnippets,
} from "@/lib/db/snippets";
import { handleError, success } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import type { Snippet } from "@/db/models/snippets";

interface ExportSnippetsInput {
  type?: "code" | "text" | "command";
  favorite?: boolean;
}

export async function getSnippetsForExport(
  filters?: ExportSnippetsInput
): Promise<ActionResult<Snippet[]>> {
  try {
    const userId = await getCurrentUserId();

    let snippets: Snippet[];

    if (filters?.favorite) {
      snippets = await getFavoriteSnippets(userId);
    } else if (filters?.type) {
      snippets = await getSnippetsByUserIdAndType(userId, filters.type);
    } else {
      snippets = await getSnippetsByUserId(userId);
    }

    return success(snippets);
  } catch (error) {
    return handleError(error, "Failed to fetch snippets for export");
  }
}

