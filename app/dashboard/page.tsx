import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSnippetStats, getRecentSnippets } from "@/lib/db/snippets";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SnippetsGrid } from "@/components/snippets/snippets-grid";
import {
  Code2,
  FileText,
  Terminal,
  Star,
  Copy,
  Clock,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const stats = await getSnippetStats(user.id);
  const recentSnippets = await getRecentSnippets(user.id, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Overview of your snippets and activity
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/snippets/new">
            <Plus className="mr-2 size-4" />
            New Snippet
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Snippets"
          value={stats.total}
          icon={Code2}
          description="All your snippets"
        />
        <StatsCard
          title="Favorites"
          value={stats.favorites}
          icon={Star}
          description="Starred snippets"
        />
        <StatsCard
          title="Total Uses"
          value={stats.totalUses}
          icon={Copy}
          description="Times copied"
        />
        <StatsCard
          title="Recent"
          value={recentSnippets.length}
          icon={Clock}
          description="Recently updated"
        />
      </div>

      {stats.total > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Code Snippets"
            value={stats.code}
            icon={Code2}
            className="md:col-span-1"
          />
          <StatsCard
            title="Text Snippets"
            value={stats.text}
            icon={FileText}
            className="md:col-span-1"
          />
          <StatsCard
            title="Commands"
            value={stats.command}
            icon={Terminal}
            className="md:col-span-1"
          />
        </div>
      )}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Recent Snippets
          </h2>
          {recentSnippets.length > 0 && (
            <Button variant="ghost" asChild>
              <Link href="/dashboard/snippets">View All</Link>
            </Button>
          )}
        </div>

        <SnippetsGrid
          snippets={recentSnippets}
          emptyState={
            <EmptyState
              title="No snippets yet"
              description="Create your first snippet to get started. Save code, text, or commands for quick access."
              actionLabel="Create Your First Snippet"
              actionHref="/dashboard/snippets/new"
            />
          }
        />
      </div>
    </div>
  );
}
