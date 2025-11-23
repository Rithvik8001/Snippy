import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getSnippetById } from "@/lib/db/snippets";
import { DeleteSnippetDialog } from "@/components/snippets/delete-snippet-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/snippets/code-editor";
import { Star, Edit, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/snippets/copy-button";
import { FavoriteButton } from "@/components/snippets/favorite-button";
import { SnippetAiAssistant } from "@/components/snippets/snippet-ai-assistant";
import { ConvertSnippetButton } from "@/components/snippets/convert-snippet-button";

interface SnippetDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SnippetDetailPage({
  params,
}: SnippetDetailPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  let id: string;
  let snippet: NonNullable<Awaited<ReturnType<typeof getSnippetById>>>;

  try {
    const resolvedParams = await params;
    id = resolvedParams.id;

    if (!id || typeof id !== "string") {
      notFound();
    }

    const fetchedSnippet = await getSnippetById(user.id, id);

    if (!fetchedSnippet) {
      notFound();
    }

    snippet = fetchedSnippet;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === "cancelation"
    ) {
      throw error;
    }

    console.error("Error loading snippet:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    notFound();
  }

  const contentToDisplay =
    snippet.type === "command" ? snippet.command : snippet.content;

  const isFavorite = Boolean(snippet.isFavorite ?? false);

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return "Unknown";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      return dateObj.toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {snippet.title}
            </h1>
            {isFavorite && (
              <Star className="size-5 fill-yellow-500 text-yellow-500" />
            )}
          </div>
          <p className="mt-2 text-muted-foreground">
            {snippet.type.charAt(0).toUpperCase() + snippet.type.slice(1)}
            {snippet.type === "code" && snippet.language && (
              <span className="ml-2">• {snippet.language}</span>
            )}
            {snippet.type === "code" && snippet.framework && (
              <span className="ml-2">• {snippet.framework}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {snippet.type === "code" && (
            <ConvertSnippetButton
              snippetContent={contentToDisplay || ""}
              language={snippet.language}
              snippetType={snippet.type}
            />
          )}
          <FavoriteButton
            snippetId={id}
            isFavorite={isFavorite}
            variant="outline"
          />
          <Button variant="outline" asChild>
            <Link href={`/dashboard/snippets/${id}/edit`}>
              <Edit className="mr-2 size-4" />
              Edit
            </Link>
          </Button>
          <DeleteSnippetDialog snippetId={id} snippetTitle={snippet.title} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content</CardTitle>
                {contentToDisplay && (
                  <CopyButton
                    content={contentToDisplay}
                    snippetId={snippet.id}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {snippet.type === "code" || snippet.type === "command" ? (
                <CodeEditor
                  value={contentToDisplay || ""}
                  language={
                    snippet.type === "code"
                      ? snippet.language || "typescript"
                      : "bash"
                  }
                  readOnly={true}
                />
              ) : (
                <div className="rounded-md border border-border bg-muted/50 p-4">
                  <pre className="whitespace-pre-wrap word text-sm">
                    {contentToDisplay || "No content"}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <SnippetAiAssistant
            snippetContent={contentToDisplay || ""}
            language={snippet.type === "code" ? snippet.language : null}
            snippetTitle={snippet.title}
            snippetType={snippet.type}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="secondary">
                  {snippet.type.charAt(0).toUpperCase() + snippet.type.slice(1)}
                </Badge>
              </div>
              {snippet.type === "code" && snippet.language && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Language</span>
                  <Badge variant="outline">{snippet.language}</Badge>
                </div>
              )}
              {snippet.type === "code" && snippet.framework && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Framework</span>
                  <span className="font-medium">{snippet.framework}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className="font-medium">
                  {snippet.useCount} {snippet.useCount === 1 ? "time" : "times"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-4" />
                  Created
                </span>
                <span className="font-medium">
                  {formatDate(snippet.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="size-4" />
                  Updated
                </span>
                <span className="font-medium">
                  {formatDate(snippet.updatedAt) || "Never"}
                </span>
              </div>
              {snippet.lastUsedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Used</span>
                  <span className="font-medium">
                    {formatDate(snippet.lastUsedAt)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {snippet.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {snippet.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
