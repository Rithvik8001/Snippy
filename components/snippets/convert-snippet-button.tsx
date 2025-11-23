"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CONVERSION_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "rust",
  "go",
  "java",
  "cpp",
  "c",
  "csharp",
  "swift",
  "kotlin",
  "ruby",
  "php",
  "dart",
  "scala",
  "haskell",
  "elixir",
  "clojure",
  "lua",
  "perl",
] as const;

interface ConvertSnippetButtonProps {
  snippetContent: string;
  language?: string | null;
  snippetType: "code" | "text" | "command";
}

export function ConvertSnippetButton({
  snippetContent,
  language,
  snippetType,
}: ConvertSnippetButtonProps) {
  const [targetLanguage, setTargetLanguage] = useState<string>("typescript");
  const router = useRouter();

  const chat = useMemo(
    () =>
      new Chat({
        transport: new DefaultChatTransport({
          api: "/api/chat",
        }),
      }),
    []
  );

  const { messages, sendMessage, setMessages, status } = useChat({
    chat,
    onFinish: ({ message }) => {
      handleConversionComplete(message);
    },
    onError: (error) => {
      console.error("Conversion error:", error);
      toast.error("Failed to convert snippet. Please try again.", {
        id: "converting",
      });
    },
  });

  const isProcessingRef = useRef(false);

  const handleConversionComplete = (message: {
    parts: Array<{ type: string; text?: string }>;
  }) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Extract code from the completed message
    const responseText = message.parts
      .filter((p) => p.type === "text")
      .map((p) => {
        if (p.type === "text") {
          return p.text || "";
        }
        return "";
      })
      .join("");

    // Try to extract code block - try multiple patterns
    let codeBlockMatch = responseText.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (!codeBlockMatch) {
      // Try without language tag
      codeBlockMatch = responseText.match(/```\n([\s\S]*?)```/);
    }
    if (!codeBlockMatch) {
      // Try with just backticks
      codeBlockMatch = responseText.match(/```([\s\S]*?)```/);
    }

    if (codeBlockMatch) {
      const convertedCode = codeBlockMatch[1].trim();

      // Build URL with search params
      const params = new URLSearchParams();
      params.set("type", "code");
      params.set("content", convertedCode);
      params.set("language", targetLanguage);

      // Redirect to create page
      router.push(`/dashboard/snippets/new?${params.toString()}`);
      toast.success("Code converted! Fill in the details to save.", {
        id: "converting",
      });

      // Clear chat messages after successful conversion
      setMessages([]);
      isProcessingRef.current = false;
    } else {
      console.error("No code block found in response:", responseText);
      toast.error(
        "Could not extract converted code from response. Full response: " +
          responseText.substring(0, 200),
        { id: "converting" }
      );
      isProcessingRef.current = false;
    }
  };

  // Watch messages for completion as fallback
  useEffect(() => {
    if (
      status !== "streaming" &&
      status !== "submitted" &&
      messages.length > 0 &&
      !isProcessingRef.current
    ) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        handleConversionComplete(lastMessage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, status]);

  const handleConvert = () => {
    if (snippetType !== "code") {
      toast.error("Conversion is only available for code snippets");
      return;
    }

    if (!sendMessage) {
      console.error("sendMessage is not available");
      toast.error("Chat not initialized. Please refresh the page.");
      return;
    }

    const currentLanguage = language || "code";
    const convertPrompt = `Convert this ${currentLanguage} code snippet to ${targetLanguage}:

\`\`\`${currentLanguage}
${snippetContent}
\`\`\`

Please provide ONLY the converted code in a code block with the language tag "${targetLanguage}". Do not include any explanation or additional text, just the code block.`;

    // Show loading toast immediately
    toast.loading("Converting code...", { id: "converting" });

    sendMessage({ text: convertPrompt }).catch((error) => {
      console.error("Conversion error:", error);
      toast.error("Failed to convert snippet. Please try again.", {
        id: "converting",
      });
    });
  };

  const isConverting = status === "streaming" || status === "submitted";

  if (snippetType !== "code") {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
        <SelectTrigger className="w-[140px]" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CONVERSION_LANGUAGES.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={handleConvert}
        disabled={isConverting}
      >
        {isConverting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Code2 className="mr-2 size-4" />
            Convert
          </>
        )}
      </Button>
    </div>
  );
}
