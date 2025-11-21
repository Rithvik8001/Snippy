"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; type?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Ignore React cancellation errors (these are expected during navigation)
    const errorObj = error as { type?: string; message?: string };
    if (errorObj.type === "cancelation") {
      return; // Don't log cancellation errors - they're expected
    }
    console.error("Snippet detail page error:", error);
  }, [error]);

  // Don't show error UI for cancellation errors - they're expected
  const errorObj = error as { type?: string; message?: string };
  if (errorObj.type === "cancelation") {
    return null; // Don't render anything for cancellation errors
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-destructive" />
            <CardTitle>Error Loading Snippet</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || "An error occurred while loading the snippet."}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              Try Again
            </Button>
            <Button asChild>
              <Link href="/dashboard/snippets">Back to Snippets</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

