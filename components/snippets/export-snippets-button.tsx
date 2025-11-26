"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSnippetsForExport } from "@/actions/snippets-export";
import {
  exportSnippetsToJson,
  exportSnippetsToCsv,
  downloadFile,
  generateExportFilename,
} from "@/lib/export/snippets-export";
import { useSearchParams } from "next/navigation";

interface ExportSnippetsButtonProps {
  className?: string;
}

export function ExportSnippetsButton({ className }: ExportSnippetsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleExport = async (format: "json" | "csv") => {
    setIsExporting(true);

    try {
      // Get current filters from URL
      const type = searchParams.get("type") as
        | "code"
        | "text"
        | "command"
        | undefined;
      const favorite = searchParams.get("favorite") === "true";

      const result = await getSnippetsForExport({
        type,
        favorite,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to export snippets");
        return;
      }

      const snippets = result.data || [];

      if (snippets.length === 0) {
        toast.info("No snippets to export");
        return;
      }

      // Export based on format
      let content: string;
      let mimeType: string;

      if (format === "json") {
        content = exportSnippetsToJson(snippets);
        mimeType = "application/json";
      } else {
        content = exportSnippetsToCsv(snippets);
        mimeType = "text/csv";
      }

      // Download file
      const filename = generateExportFilename(format);
      downloadFile(content, filename, mimeType);

      toast.success(
        `Exported ${snippets.length} snippet${snippets.length === 1 ? "" : "s"} as ${format.toUpperCase()}`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export snippets. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className={className}
          aria-label="Export snippets"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              <span className="sr-only">Exporting</span>
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 size-4" aria-hidden="true" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("json")}
          disabled={isExporting}
          aria-label="Export as JSON"
        >
          <FileJson className="mr-2 size-4" aria-hidden="true" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isExporting}
          aria-label="Export as CSV"
        >
          <FileSpreadsheet className="mr-2 size-4" aria-hidden="true" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

