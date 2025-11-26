import Link from "next/link";
import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Snippet } from "@/db/models/snippets";
import { cn } from "@/lib/utils";

interface SnippetCardProps {
  snippet: Snippet;
  className?: string;
}

function getContentPreview(snippet: Snippet): string {
  if (snippet.type === "command" && snippet.command) {
    return snippet.command;
  }
  if (snippet.content) {
    // For code snippets, show first 2-3 lines
    if (snippet.type === "code") {
      const lines = snippet.content.split("\n").slice(0, 3);
      return lines.join("\n");
    }
    // For text snippets, show first 100 characters
    return snippet.content.slice(0, 100);
  }
  return "";
}

export function SnippetCard({ snippet, className }: SnippetCardProps) {
  const preview = getContentPreview(snippet);
  const isCodeOrCommand = snippet.type === "code" || snippet.type === "command";

  return (
    <article className={className}>
      <Link
        href={`/dashboard/snippets/${snippet.id}`}
        aria-label={`View snippet: ${snippet.title}`}
      >
        <Card
          className={cn(
            "transition-all duration-300 hover:shadow-md cursor-pointer h-full flex flex-col",
            className
          )}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{snippet.title}</CardTitle>
                <CardDescription className="mt-1">
                  <span className="sr-only">Snippet type: </span>
                  {snippet.type.charAt(0).toUpperCase() + snippet.type.slice(1)}
                  {snippet.type === "code" && snippet.language && (
                    <span className="ml-2">
                      <span className="sr-only">Language: </span>
                      • {snippet.language}
                    </span>
                  )}
                </CardDescription>
              </div>
              {snippet.isFavorite && (
                <Star
                  className="size-4 fill-yellow-500 text-yellow-500 shrink-0 ml-2"
                  aria-label="Favorite snippet"
                  aria-hidden="false"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {preview && (
              <div
                className={cn(
                  "mb-3 text-sm text-muted-foreground overflow-hidden",
                  isCodeOrCommand && "font-mono text-xs"
                )}
              >
                <pre className="whitespace-pre-wrap break-words" aria-label="Snippet preview">
                  {preview}
                  {snippet.type === "text" &&
                    snippet.content &&
                    snippet.content.length > 100 &&
                    "..."}
                </pre>
              </div>
            )}
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto">
              <span aria-label={`Used ${snippet.useCount} ${snippet.useCount === 1 ? "time" : "times"}`}>
                Used {snippet.useCount} {snippet.useCount === 1 ? "time" : "times"}
              </span>
              <time
                dateTime={snippet.updatedAt ? new Date(snippet.updatedAt).toISOString() : undefined}
                aria-label={`Last updated: ${snippet.updatedAt ? new Date(snippet.updatedAt).toLocaleDateString() : "Never"}`}
              >
                {snippet.updatedAt
                  ? new Date(snippet.updatedAt).toLocaleDateString()
                  : "Never"}
              </time>
            </div>
            {snippet.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1" role="list" aria-label="Tags">
                {snippet.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    role="listitem"
                    className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {snippet.tags.length > 3 && (
                  <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium">
                    +{snippet.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </article>
  );
}

