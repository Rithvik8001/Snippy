import { SnippetCard } from "./snippet-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { Snippet } from "@/db/models/snippets";
import { cn } from "@/lib/utils";

interface SnippetsGridProps {
  snippets: Snippet[];
  emptyState?: React.ReactNode;
  className?: string;
}

export function SnippetsGrid({
  snippets,
  emptyState,
  className,
}: SnippetsGridProps) {
  if (snippets.length === 0) {
    return (
      <>{emptyState || <EmptyState title="No snippets found" description="Try adjusting your filters or create a new snippet." />}</>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {snippets.map((snippet) => (
        <SnippetCard key={snippet.id} snippet={snippet} />
      ))}
    </div>
  );
}

