"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Star, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Kbd, useModifierKey } from "@/components/ui/kbd";

interface SnippetsFiltersProps {
  defaultType?: string;
  defaultFavorite?: boolean;
  defaultSearch?: string;
}

export function SnippetsFilters({
  defaultType,
  defaultFavorite,
  defaultSearch,
}: SnippetsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(urlSearch || defaultSearch || "");
  const [debouncedSearch, setDebouncedSearch] = useState(
    urlSearch || defaultSearch || ""
  );
  const [isExtractingKeywords, setIsExtractingKeywords] = useState(false);
  const [isAiEnhanced, setIsAiEnhanced] = useState(false);
  const modifierKey = useModifierKey();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const extractKeywords = async (query: string) => {
    if (!query || query.trim().length === 0) return;

    // Only use AI for longer queries (more than 2 words)
    const wordCount = query.trim().split(/\s+/).length;
    if (wordCount <= 2) {
      return;
    }

    setIsExtractingKeywords(true);
    try {
      const response = await fetch("/api/search/extract-keywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to extract keywords");
      }

      const data = await response.json();
      if (data.keywords && data.keywords.length > 0) {
        const extractedKeywords = data.keywords.join(" ");
        setSearch(extractedKeywords);
        setIsAiEnhanced(true);
        toast.success("AI enhanced your search", {
          description: `Searching for: ${extractedKeywords}`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Keyword extraction error:", error);
      // Silently fail - user can still search normally
    } finally {
      setIsExtractingKeywords(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim().length > 0) {
      const wordCount = search.trim().split(/\s+/).length;
      if (wordCount > 2) {
        extractKeywords(search);
      }
    }
  };

  // Update URL when search changes
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearch === currentSearch) {
      return; // No change needed
    }

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
      setIsAiEnhanced(false);
    }

    const newSearch = params.toString();
    const newUrl = newSearch ? `?${newSearch}` : "";
    router.push(`/dashboard/snippets${newUrl}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("type");
    } else {
      params.set("type", value);
    }
    const newSearch = params.toString();
    const newUrl = newSearch ? `?${newSearch}` : "";
    router.push(`/dashboard/snippets${newUrl}`, { scroll: false });
  };

  const handleFavoriteToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    const currentFavorite = params.get("favorite") === "true";
    if (currentFavorite) {
      params.delete("favorite");
    } else {
      params.set("favorite", "true");
    }
    const newSearch = params.toString();
    const newUrl = newSearch ? `?${newSearch}` : "";
    router.push(`/dashboard/snippets${newUrl}`, { scroll: false });
  };

  const handleClearFilters = () => {
    setSearch("");
    setIsAiEnhanced(false);
    router.push("/dashboard/snippets", { scroll: false });
  };

  const currentType = searchParams.get("type") || "all";
  const isFavorite = searchParams.get("favorite") === "true";
  const hasActiveFilters =
    currentType !== "all" || isFavorite || debouncedSearch.length > 0;

  return (
    <div
      role="search"
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 max-w-md">
          <label htmlFor="snippet-search" className="sr-only">
            Search snippets
          </label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="snippet-search"
            type="text"
            placeholder="Search snippets by title or tags... (Press Enter for AI search)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsAiEnhanced(false);
            }}
            onKeyDown={handleSearchKeyDown}
            className={cn("pl-9 pr-20", isAiEnhanced && "pr-32")}
            disabled={isExtractingKeywords}
            aria-label="Search snippets by title or tags"
            aria-describedby="search-help"
            aria-busy={isExtractingKeywords}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isExtractingKeywords ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : (
              <>
                {isAiEnhanced && (
                  <Sparkles className="size-4 text-primary" aria-label="AI enhanced search active" aria-hidden="true" />
                )}
                <Kbd keys={[modifierKey, "K"]} className="hidden sm:inline-flex" />
              </>
            )}
          </div>
          <span id="search-help" className="sr-only">
            Press Enter to enhance search with AI for queries longer than 2 words
          </span>
        </div>
        <Select value={currentType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[140px]" aria-label="Filter by snippet type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="code">Code</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="command">Command</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={isFavorite ? "default" : "outline"}
          size="default"
          onClick={handleFavoriteToggle}
          className="shrink-0"
          aria-label={isFavorite ? "Show all snippets" : "Show only favorites"}
          aria-pressed={isFavorite}
        >
          <Star
            className={cn(
              "size-4 mr-2",
              isFavorite && "fill-yellow-500 text-yellow-500"
            )}
            aria-hidden="true"
          />
          Favorites
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="default"
            onClick={handleClearFilters}
            className="shrink-0"
            aria-label="Clear all filters"
          >
            <X className="size-4 mr-2" aria-hidden="true" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

