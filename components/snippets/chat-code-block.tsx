"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CodeEditor } from "./code-editor";
import { Button } from "@/components/ui/button";
import { Copy, Check, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatCodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function ChatCodeBlock({
  code,
  language,
  className,
}: ChatCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSaveAsNew = () => {
    // Determine snippet type based on language
    let snippetType: "code" | "text" | "command" = "code";
    let detectedLanguage = language || "typescript";

    // If language is bash/shell, treat as command
    if (
      language === "bash" ||
      language === "shell" ||
      language === "sh" ||
      language === "zsh"
    ) {
      snippetType = "command";
      detectedLanguage = "";
    }

    // Build URL with search params
    const params = new URLSearchParams();
    params.set("type", snippetType);
    params.set("content", code);
    if (detectedLanguage) {
      params.set("language", detectedLanguage);
    }

    router.push(`/dashboard/snippets/new?${params.toString()}`);
  };

  return (
    <div className={cn("space-y-0 my-4", className)}>
      <div className="flex items-center justify-between rounded-t-md border border-b-0 border-border bg-muted/50 px-3 py-2">
        <div className="flex items-center gap-2">
          {language && (
            <span className="text-xs font-mono text-muted-foreground">
              {language}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 gap-1.5 text-foreground hover:bg-muted"
          >
            {copied ? (
              <>
                <Check className="size-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveAsNew}
            className="h-7 gap-1.5 text-foreground hover:bg-muted"
          >
            <Save className="size-3" />
            Save as New
          </Button>
        </div>
      </div>
      <div className="[&>div]:rounded-t-none [&>div]:border-t-0 [&>div>div]:border-t-0">
        <CodeEditor value={code} language={language} readOnly={true} />
      </div>
    </div>
  );
}
