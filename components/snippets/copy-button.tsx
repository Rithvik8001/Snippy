"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { copySnippet } from "@/actions/snippets";
import { toast } from "sonner";

interface CopyButtonProps {
  content: string;
  snippetId: string;
}

export function CopyButton({ content, snippetId }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      
      // Update use count on server
      await copySnippet(snippetId);
      
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-2"
      aria-label={copied ? "Copied to clipboard" : "Copy snippet content"}
      aria-pressed={copied}
    >
      {copied ? (
        <>
          <Check className="size-4" aria-hidden="true" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-4" aria-hidden="true" />
          Copy
        </>
      )}
    </Button>
  );
}

