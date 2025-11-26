"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteSnippet } from "@/actions/snippets";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteSnippetDialogProps {
  snippetId: string;
  snippetTitle: string;
  trigger?: React.ReactNode;
}

export function DeleteSnippetDialog({
  snippetId,
  snippetTitle,
  trigger,
}: DeleteSnippetDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteSnippet(snippetId);

      if (!result.success) {
        toast.error(result.error || "Failed to delete snippet");
        setIsDeleting(false);
        return;
      }

      toast.success("Snippet deleted successfully");
      setOpen(false);
      router.push("/dashboard/snippets");
      router.refresh();
    } catch (error) {
      console.error("Error deleting snippet:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm" aria-label={`Delete snippet: ${snippetTitle}`}>
            <Trash2 className="mr-2 size-4" aria-hidden="true" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent aria-describedby="delete-description">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Snippet</AlertDialogTitle>
          <AlertDialogDescription id="delete-description">
            Are you sure you want to delete "{snippetTitle}"? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            aria-busy={isDeleting}
          >
            {isDeleting && (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                <span className="sr-only">Deleting snippet</span>
              </>
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

