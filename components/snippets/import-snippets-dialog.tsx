"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { importSnippetsFromFile } from "@/actions/snippets-import";
import {
  parseJsonImport,
  parseCsvImport,
  validateImportSnippets,
  type ImportValidationResult,
} from "@/lib/import/snippets-import";

interface ImportSnippetsDialogProps {
  trigger?: React.ReactNode;
}

export function ImportSnippetsDialog({ trigger }: ImportSnippetsDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"json" | "csv" | null>(null);
  const [preview, setPreview] = useState<ImportValidationResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(null);

    // Determine file type
    const fileName = selectedFile.name.toLowerCase();
    let detectedType: "json" | "csv" | null = null;

    if (fileName.endsWith(".json")) {
      detectedType = "json";
    } else if (fileName.endsWith(".csv")) {
      detectedType = "csv";
    } else {
      toast.error("Unsupported file type. Please select a JSON or CSV file.");
      return;
    }

    setFileType(detectedType);

    // Read and parse file
    try {
      const text = await selectedFile.text();

      let snippets: Array<unknown>;
      if (detectedType === "json") {
        const parsed = parseJsonImport(text);
        snippets = parsed.snippets;
      } else {
        snippets = parseCsvImport(text);
      }

      // Validate snippets
      const validation = validateImportSnippets(snippets);
      setPreview(validation);

      if (validation.valid.length === 0) {
        toast.error("No valid snippets found in file.");
      } else {
        toast.success(
          `Found ${validation.valid.length} valid snippet${validation.valid.length === 1 ? "" : "s"}${validation.invalid.length > 0 ? ` (${validation.invalid.length} invalid)` : ""}`
        );
      }
    } catch (error) {
      console.error("File parsing error:", error);
      toast.error(
        `Failed to parse ${detectedType.toUpperCase()} file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setFile(null);
      setFileType(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file || !fileType || !preview || preview.valid.length === 0) {
      return;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      const result = await importSnippetsFromFile(text, fileType);

      if (!result.success) {
        toast.error(result.error || "Failed to import snippets");
        return;
      }

      const importResult = result.data!;

      if (importResult.successful > 0) {
        toast.success(
          `Successfully imported ${importResult.successful} snippet${importResult.successful === 1 ? "" : "s"}`
        );
        setOpen(false);
        setFile(null);
        setFileType(null);
        setPreview(null);
        router.refresh();
      }

      if (importResult.failed > 0) {
        toast.warning(
          `${importResult.failed} snippet${importResult.failed === 1 ? "" : "s"} failed to import`
        );
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import snippets. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileType(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" aria-label="Import snippets">
            <Upload className="mr-2 size-4" aria-hidden="true" />
            Import
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="import-description">
        <DialogHeader>
          <DialogTitle>Import Snippets</DialogTitle>
          <DialogDescription id="import-description">
            Upload a JSON or CSV file to import snippets. The file will be validated before importing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileInputChange}
              className="hidden"
              id="import-file-input"
              aria-label="Select file to import"
            />
            <label htmlFor="import-file-input">
              <Button
                type="button"
                variant="outline"
                asChild
                className="cursor-pointer"
              >
                <span>
                  <Upload className="mr-2 size-4" aria-hidden="true" />
                  {file ? file.name : "Choose File"}
                </span>
              </Button>
            </label>
            {file && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                aria-label="Clear selected file"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Preview */}
          {preview && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h3 className="text-sm font-semibold mb-1">Import Preview</h3>
                <p className="text-sm text-muted-foreground">
                  {preview.valid.length} valid snippet{preview.valid.length === 1 ? "" : "s"} ready to import
                  {preview.invalid.length > 0 && (
                    <> • {preview.invalid.length} invalid snippet{preview.invalid.length === 1 ? "" : "s"} will be skipped</>
                  )}
                </p>
              </div>

              {/* Valid Snippets Table */}
              {preview.valid.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Valid Snippets ({preview.valid.length})</h3>
                  <div className="border rounded-md max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Language</TableHead>
                          <TableHead>Tags</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.valid.slice(0, 10).map((snippet, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{snippet.title}</TableCell>
                            <TableCell>{snippet.type}</TableCell>
                            <TableCell>{snippet.type === "code" ? snippet.language || "-" : "-"}</TableCell>
                            <TableCell>
                              {snippet.tags.length > 0
                                ? snippet.tags.slice(0, 3).join(", ") +
                                  (snippet.tags.length > 3 ? "..." : "")
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                        {preview.valid.length > 10 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              ... and {preview.valid.length - 10} more
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Invalid Snippets */}
              {preview.invalid.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-destructive">
                    Invalid Snippets ({preview.invalid.length})
                  </h3>
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Index</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Errors</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.invalid.slice(0, 5).map((item) => (
                          <TableRow key={item.index}>
                            <TableCell>{item.index + 1}</TableCell>
                            <TableCell>
                              {(item.data as { title?: string }).title || "-"}
                            </TableCell>
                            <TableCell className="text-sm text-destructive">
                              {item.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")}
                            </TableCell>
                          </TableRow>
                        ))}
                        {preview.invalid.length > 5 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              ... and {preview.invalid.length - 5} more errors
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              handleReset();
            }}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || !preview || preview.valid.length === 0 || isImporting}
            aria-busy={isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                <span className="sr-only">Importing snippets</span>
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" aria-hidden="true" />
                Import {preview?.valid.length || 0} Snippet{preview?.valid.length === 1 ? "" : "s"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

