"use client";

import { useEffect } from "react";

interface UseKeyboardNavigationOptions {
  onSearchFocus?: () => void;
  onNewSnippet?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onSearchFocus,
  onNewSnippet,
  enabled = true,
}: UseKeyboardNavigationOptions = {}) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Focus search input
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("snippet-search");
        if (searchInput && onSearchFocus) {
          onSearchFocus();
          // Small delay to ensure input is visible
          setTimeout(() => {
            searchInput.focus();
          }, 0);
        }
      }

      // Ctrl/Cmd + N: New snippet
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        if (onNewSnippet) {
          onNewSnippet();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onSearchFocus, onNewSnippet]);
}

