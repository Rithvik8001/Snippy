"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Kbd, useModifierKey } from "@/components/ui/kbd";
import { Plus } from "lucide-react";

export function NewSnippetButton() {
  const modifierKey = useModifierKey();

  return (
    <Button asChild size="lg">
      <Link href="/dashboard/snippets/new" className="flex items-center gap-2">
        <Plus className="size-4" />
        <span>New Snippet</span>
        <Kbd keys={[modifierKey, "N"]} className="hidden sm:inline-flex" />
      </Link>
    </Button>
  );
}

