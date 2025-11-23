"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, User, Sparkles, Loader2, Send, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatCodeBlock } from "./chat-code-block";
import { toast } from "sonner";

interface SnippetAiAssistantProps {
  snippetContent: string;
  language?: string | null;
  snippetTitle: string;
  snippetType: "code" | "text" | "command";
}

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

export function SnippetAiAssistant({
  snippetContent,
  language,
  snippetTitle,
  snippetType,
}: SnippetAiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [localInput, setLocalInput] = useState("");
  const [targetLanguage, setTargetLanguage] = useState<string>("typescript");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = useMemo(
    () =>
      new Chat({
        transport: new DefaultChatTransport({
          api: "/api/chat",
        }),
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({ chat });
  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-send initial explanation when chat is opened for the first time
  useEffect(() => {
    if (isOpen && !hasInitialized && messages.length === 0 && sendMessage) {
      const languageLabel =
        snippetType === "code"
          ? language || "code"
          : snippetType === "command"
          ? "command/terminal"
          : "text";

      const initialPrompt = `Explain this ${languageLabel} snippet titled "${snippetTitle}":

\`\`\`${language || ""}
${snippetContent}
\`\`\`

Please provide a clear, concise explanation of what this snippet does and why it matters.`;

      // Send initial message using sendMessage
      sendMessage({ text: initialPrompt });
      // Use setTimeout to avoid calling setState synchronously in effect
      setTimeout(() => {
        setHasInitialized(true);
      }, 0);
    }
  }, [
    isOpen,
    hasInitialized,
    messages.length,
    snippetContent,
    language,
    snippetTitle,
    snippetType,
    sendMessage,
  ]);

  const handleToggle = () => {
    if (isOpen) {
      // Closing the chat - reset initialization state
      setIsOpen(false);
      setHasInitialized(false);
    } else {
      // Opening the chat
      setIsOpen(true);
    }
  };

  const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalInput(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (localInput && localInput.trim()) {
      sendMessage({ text: localInput });
      setLocalInput("");
    }
  };

  const handleConvert = () => {
    if (snippetType !== "code") {
      toast.error("Conversion is only available for code snippets");
      return;
    }

    const currentLanguage = language || "code";
    const convertPrompt = `Convert this ${currentLanguage} code snippet to ${targetLanguage}:

\`\`\`${currentLanguage}
${snippetContent}
\`\`\`

Please provide the converted code in a code block with the language tag "${targetLanguage}". Include a brief explanation of any significant changes or considerations.`;

    sendMessage({ text: convertPrompt });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <div>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Get explanations and ask questions about this snippet
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOpen && snippetType === "code" && (
              <div className="flex items-center gap-2">
                <Select
                  value={targetLanguage}
                  onValueChange={setTargetLanguage}
                >
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
                  disabled={isLoading}
                >
                  <Code2 className="mr-2 size-4" />
                  Convert
                </Button>
              </div>
            )}
            <Button
              variant={isOpen ? "outline" : "default"}
              onClick={handleToggle}
              size="sm"
            >
              {isOpen ? "Hide" : "Explain with AI"}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto p-4 border border-border rounded-md bg-muted/30">
            {messages.length === 0 && status !== "streaming" && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="size-8 mx-auto mb-2 opacity-50" />
                <p>Starting explanation...</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="shrink-0 size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="size-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  )}
                >
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        >
                          <ReactMarkdown
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              code: ({ className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                const codeLanguage = match ? match[1] : "";
                                const codeString = String(children).replace(
                                  /\n$/,
                                  ""
                                );
                                const isInline = !className || !match;

                                if (!isInline && codeString) {
                                  return (
                                    <ChatCodeBlock
                                      code={codeString}
                                      language={codeLanguage}
                                    />
                                  );
                                }

                                return (
                                  <code
                                    className={cn(
                                      "rounded bg-muted px-1.5 py-0.5 text-sm font-mono",
                                      className
                                    )}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0 leading-relaxed">
                                  {children}
                                </p>
                              ),
                              ul: ({ children }) => (
                                <ul className="mb-2 ml-4 list-disc last:mb-0 space-y-1">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="mb-2 ml-4 list-decimal last:mb-0 space-y-1">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="mb-1 last:mb-0">{children}</li>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold">
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic">{children}</em>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-base font-semibold mb-2 mt-3 first:mt-0">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">
                                  {children}
                                </h3>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-border pl-4 italic my-2">
                                  {children}
                                </blockquote>
                              ),
                              a: ({ children, href }) => (
                                <a
                                  href={href}
                                  className="text-primary underline hover:text-primary/80"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {part.text}
                          </ReactMarkdown>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                {message.role === "user" && (
                  <div className="shrink-0 size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="size-4 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="shrink-0 size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="size-4 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-lg px-4 py-2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={localInput}
              onChange={handleLocalInputChange}
              placeholder="Ask a follow-up question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !localInput || !localInput.trim()}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
