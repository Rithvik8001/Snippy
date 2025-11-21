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
import { Search, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

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
    router.push("/dashboard/snippets", { scroll: false });
  };

  const currentType = searchParams.get("type") || "all";
  const isFavorite = searchParams.get("favorite") === "true";
  const hasActiveFilters =
    currentType !== "all" || isFavorite || debouncedSearch.length > 0;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search snippets by title or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={currentType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[140px]">
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
        >
          <Star
            className={cn(
              "size-4 mr-2",
              isFavorite && "fill-yellow-500 text-yellow-500"
            )}
          />
          Favorites
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="default"
            onClick={handleClearFilters}
            className="shrink-0"
          >
            <X className="size-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

