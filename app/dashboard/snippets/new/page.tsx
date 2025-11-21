import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { CreateSnippetForm } from "@/components/snippets/create-snippet-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewSnippetPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

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
          <CreateSnippetForm />
        </CardContent>
      </Card>
    </div>
  );
}

