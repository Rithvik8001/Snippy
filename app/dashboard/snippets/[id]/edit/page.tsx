import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getSnippetById } from "@/lib/db/snippets";
import { EditSnippetForm } from "@/components/snippets/edit-snippet-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EditSnippetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSnippetPage({
  params,
}: EditSnippetPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const snippet = await getSnippetById(user.id, id);

  if (!snippet) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Snippet</h1>
        <p className="mt-2 text-muted-foreground">
          Update your snippet details below
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Snippet Details</CardTitle>
          <CardDescription>
            Make changes to your snippet and save when done
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditSnippetForm snippet={snippet} />
        </CardContent>
      </Card>
    </div>
  );
}

