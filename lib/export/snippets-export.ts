import type { Snippet } from "@/db/models/snippets";

export interface ExportMetadata {
  exportedAt: string;
  version: string;
  totalCount: number;
}

export interface ExportData {
  metadata: ExportMetadata;
  snippets: Snippet[];
}

/**
 * Export snippets to JSON format
 */
export function exportSnippetsToJson(snippets: Snippet[]): string {
  const exportData: ExportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      totalCount: snippets.length,
    },
    snippets,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export snippets to CSV format
 */
export function exportSnippetsToCsv(snippets: Snippet[]): string {
  const headers = [
    "id",
    "type",
    "title",
    "tags",
    "content",
    "command",
    "language",
    "framework",
    "isFavorite",
    "createdAt",
    "updatedAt",
    "lastUsedAt",
    "useCount",
  ];

  // Escape CSV values (handle quotes, commas, newlines)
  const escapeCsvValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return "";
    }

    const stringValue = String(value);

    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n") ||
      stringValue.includes("\r")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  // Convert array to comma-separated string
  const arrayToCsv = (arr: string[]): string => {
    return arr.map((item) => escapeCsvValue(item)).join(",");
  };

  // Build CSV rows
  const rows = snippets.map((snippet) => {
    return [
      escapeCsvValue(snippet.id),
      escapeCsvValue(snippet.type),
      escapeCsvValue(snippet.title),
      escapeCsvValue(arrayToCsv(snippet.tags)),
      escapeCsvValue(snippet.content || ""),
      escapeCsvValue(snippet.command || ""),
      escapeCsvValue(snippet.language || ""),
      escapeCsvValue(snippet.framework || ""),
      escapeCsvValue(snippet.isFavorite ? "true" : "false"),
      escapeCsvValue(
        snippet.createdAt ? new Date(snippet.createdAt).toISOString() : ""
      ),
      escapeCsvValue(
        snippet.updatedAt ? new Date(snippet.updatedAt).toISOString() : ""
      ),
      escapeCsvValue(
        snippet.lastUsedAt ? new Date(snippet.lastUsedAt).toISOString() : ""
      ),
      escapeCsvValue(snippet.useCount),
    ].join(",");
  });

  // Combine headers and rows
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Download file with given content and filename
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(format: "json" | "csv"): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  return `snippets-export-${timestamp}.${format}`;
}

