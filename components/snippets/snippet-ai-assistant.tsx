"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, User, Sparkles, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface SnippetAiAssistantProps {
  snippetContent: string;
  language?: string | null;
  snippetTitle: string;
  snippetType: "code" | "text" | "command";
}

export function SnippetAiAssistant({
  snippetContent,
  language,
  snippetTitle,
  snippetType,
}: SnippetAiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [localInput, setLocalInput] = useState("");
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
          <Button
            variant={isOpen ? "outline" : "default"}
            onClick={handleToggle}
            size="sm"
          >
            {isOpen ? "Hide" : "Explain with AI"}
          </Button>
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
                          className="whitespace-pre-wrap wrap-break-word text-sm"
                        >
                          {part.text}
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
