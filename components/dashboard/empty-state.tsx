import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Code2, FileText, Terminal, Plus } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel = "Create Snippet",
  actionHref = "/dashboard/snippets/new",
}: EmptyStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex gap-4 mb-4">
            <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted/50">
              <Code2 className="size-6 text-muted-foreground" />
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted/50">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted/50">
              <Terminal className="size-6 text-muted-foreground" />
            </div>
          </div>
          <Button asChild size="lg">
            <Link href={actionHref}>
              <Plus className="mr-2 size-4" />
              {actionLabel}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
