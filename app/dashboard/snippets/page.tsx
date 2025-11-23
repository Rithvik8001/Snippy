import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getSnippetsByUserId,
  getSnippetsByUserIdAndType,
  getFavoriteSnippets,
} from "@/lib/db/snippets";
import { SnippetsGrid } from "@/components/snippets/snippets-grid";
import { SnippetsFilters } from "@/components/snippets/snippets-filters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Snippet } from "@/db/models/snippets";

interface SnippetsPageProps {
  searchParams: Promise<{
    type?: string;
    favorite?: string;
    search?: string;
  }>;
}

function filterSnippets(snippets: Snippet[], search?: string): Snippet[] {
  if (!search) return snippets;

  const query = search.toLowerCase().trim();
  if (!query) return snippets;

  // Split query into keywords (space-separated)
  const keywords = query.split(/\s+/).filter((kw) => kw.length > 0);

  return snippets.filter((snippet) => {
    const titleLower = snippet.title.toLowerCase();
    const tagsLower = snippet.tags.map((tag) => tag.toLowerCase());

    // Get content to search (content field for code/text, command field for commands)
    const contentLower = (
      snippet.content ||
      snippet.command ||
      ""
    ).toLowerCase();

    // Also check language and framework
    const languageLower = (snippet.language || "").toLowerCase();
    const frameworkLower = (snippet.framework || "").toLowerCase();

    // Check if snippet matches keywords
    // Use flexible matching: snippet matches if it contains at least one keyword
    // AND has a high match score (at least 50% of keywords match)
    const matchCount = keywords.filter((keyword) => {
      return (
        titleLower.includes(keyword) ||
        tagsLower.some((tag) => tag.includes(keyword)) ||
        contentLower.includes(keyword) ||
        languageLower.includes(keyword) ||
        frameworkLower.includes(keyword)
      );
    }).length;

    // Match if at least 50% of keywords are found (or at least 1 keyword)
    const matchThreshold = Math.max(1, Math.ceil(keywords.length * 0.5));
    return matchCount >= matchThreshold;
  });
}

export default async function SnippetsPage({
  searchParams,
}: SnippetsPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const type = params.type as "code" | "text" | "command" | undefined;
  const favorite = params.favorite === "true";
  const search = params.search;

  // Fetch snippets based on filters
  let snippets: Snippet[];
  if (favorite) {
    snippets = await getFavoriteSnippets(user.id);
  } else if (type) {
    snippets = await getSnippetsByUserIdAndType(user.id, type);
  } else {
    snippets = await getSnippetsByUserId(user.id);
  }

  // Apply client-side search filtering
  const filteredSnippets = filterSnippets(snippets, search);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Snippets</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and organize your code, text, and command snippets
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/snippets/new">
            <Plus className="mr-2 size-4" />
            New Snippet
          </Link>
        </Button>
      </div>

      <SnippetsFilters
        defaultType={type}
        defaultFavorite={favorite}
        defaultSearch={search}
      />

      <SnippetsGrid
        snippets={filteredSnippets}
        emptyState={
          search || type || favorite ? (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-foreground">
                No snippets match your filters
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
