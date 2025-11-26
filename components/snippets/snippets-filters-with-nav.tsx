"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SnippetsFilters } from "./snippets-filters";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";

interface SnippetsFiltersWithNavProps {
  defaultType?: string;
  defaultFavorite?: boolean;
  defaultSearch?: string;
}

export function SnippetsFiltersWithNav(props: SnippetsFiltersWithNavProps) {
  const router = useRouter();

  useKeyboardNavigation({
    onSearchFocus: () => {
      const searchInput = document.getElementById("snippet-search");
      if (searchInput) {
        searchInput.focus();
      }
    },
    onNewSnippet: () => {
      router.push("/dashboard/snippets/new");
    },
  });

  return <SnippetsFilters {...props} />;
}

