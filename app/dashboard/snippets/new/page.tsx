import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { CreateSnippetForm } from "@/components/snippets/create-snippet-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NewSnippetPageProps {
  searchParams: Promise<{
    type?: string;
    content?: string;
    language?: string;
  }>;
}

export default async function NewSnippetPage({
  searchParams,
}: NewSnippetPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const initialValues = {
    type: (params.type as "code" | "text" | "command") || undefined,
    content: params.content || undefined,
    language: params.language || undefined,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Snippet</h1>
        <p className="mt-2 text-muted-foreground">
          Save code, text, or commands for quick access
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Snippet Details</CardTitle>
          <CardDescription>
            Fill in the details below to create your snippet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateSnippetForm initialValues={initialValues} />
        </CardContent>
      </Card>
    </div>
  );
}

