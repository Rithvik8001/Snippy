import { z } from "zod";
import {
  importSnippetSchema,
  importSnippetsArraySchema,
  exportFormatSchema,
  csvRowSchema,
  type ImportSnippetInput,
} from "@/validations/import";
import { createSnippetSchema, type CreateSnippetInput } from "@/validations/snippets";

export interface ImportValidationResult {
  valid: ImportSnippetInput[];
  invalid: Array<{
    index: number;
    data: unknown;
    errors: z.ZodError["errors"];
  }>;
}

/**
 * Parse JSON import data
 */
export function parseJsonImport(jsonData: string): {
  snippets: ImportSnippetInput[];
  metadata?: {
    exportedAt?: string;
    version?: string;
    totalCount?: number;
  };
} {
  const parsed = JSON.parse(jsonData);

  // Check if it's the full export format (with metadata)
  const exportFormatResult = exportFormatSchema.safeParse(parsed);
  if (exportFormatResult.success) {
    return {
      snippets: exportFormatResult.data.snippets,
      metadata: exportFormatResult.data.metadata,
    };
  }

  // Check if it's an array of snippets
  const arrayResult = importSnippetsArraySchema.safeParse(parsed);
  if (arrayResult.success) {
    return { snippets: arrayResult.data };
  }

  // Check if it's a single snippet
  const singleResult = importSnippetSchema.safeParse(parsed);
  if (singleResult.success) {
    return { snippets: [singleResult.data] };
  }

  throw new Error("Invalid JSON format. Expected array of snippets or export format.");
}

/**
 * Parse CSV import data
 */
export function parseCsvImport(csvData: string): ImportSnippetInput[] {
  const lines = csvData.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1);

  const snippets: ImportSnippetInput[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const values = parseCsvRow(row);

    if (values.length !== headers.length) {
      continue; // Skip malformed rows
    }

    const rowData: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      rowData[header] = values[index];
    });

    const result = csvRowSchema.safeParse(rowData);
    if (result.success) {
      const snippet = result.data;

      // Convert to ImportSnippetInput format
      if (snippet.type === "code") {
        snippets.push({
          type: "code",
          title: snippet.title,
          tags: snippet.tags,
          content: snippet.content || "",
          language: snippet.language,
          framework: snippet.framework,
          isFavorite: snippet.isFavorite,
          useCount: snippet.useCount,
        });
      } else if (snippet.type === "text") {
        snippets.push({
          type: "text",
          title: snippet.title,
          tags: snippet.tags,
          content: snippet.content || "",
          isFavorite: snippet.isFavorite,
          useCount: snippet.useCount,
        });
      } else if (snippet.type === "command") {
        snippets.push({
          type: "command",
          title: snippet.title,
          tags: snippet.tags,
          command: snippet.command || "",
          isFavorite: snippet.isFavorite,
          useCount: snippet.useCount,
        });
      }
    }
  }

  return snippets;
}

/**
 * Parse a single CSV row, handling quoted values and escaped quotes
 */
function parseCsvRow(row: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of value
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add last value
  values.push(current.trim());

  return values;
}

/**
 * Validate imported snippets and convert to CreateSnippetInput
 */
export function validateImportSnippets(
  snippets: ImportSnippetInput[]
): ImportValidationResult {
  const valid: ImportSnippetInput[] = [];
  const invalid: ImportValidationResult["invalid"] = [];

  snippets.forEach((snippet, index) => {
    // Remove id and timestamps for validation (we'll create new ones)
    const { id, createdAt, updatedAt, lastUsedAt, ...snippetData } = snippet;

    // Validate against create schema
    const result = createSnippetSchema.safeParse(snippetData);

    if (result.success) {
      valid.push(snippet);
    } else {
      invalid.push({
        index,
        data: snippet,
        errors: result.error.errors,
      });
    }
  });

  return { valid, invalid };
}

/**
 * Convert ImportSnippetInput to CreateSnippetInput
 */
export function convertToCreateInput(
  snippet: ImportSnippetInput
): CreateSnippetInput {
  const { id, createdAt, updatedAt, lastUsedAt, useCount, ...snippetData } =
    snippet;
  return snippetData as CreateSnippetInput;
}

