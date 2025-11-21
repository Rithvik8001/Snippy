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

function filterSnippets(
  snippets: Snippet[],
  search?: string
): Snippet[] {
  if (!search) return snippets;

  const query = search.toLowerCase();
  return snippets.filter(
    (snippet) =>
      snippet.title.toLowerCase().includes(query) ||
      snippet.tags.some((tag) => tag.toLowerCase().includes(query))
  );
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

