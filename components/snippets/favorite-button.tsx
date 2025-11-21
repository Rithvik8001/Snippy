"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toggleFavorite } from "@/actions/snippets";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  snippetId: string;
  isFavorite: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FavoriteButton({
  snippetId,
  isFavorite,
  variant = "outline",
  size = "default",
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [currentFavorite, setCurrentFavorite] = useState(Boolean(isFavorite));

  // Sync with prop changes
  useEffect(() => {
    setCurrentFavorite(Boolean(isFavorite));
  }, [isFavorite]);

  const handleToggle = async () => {
    setIsToggling(true);

    try {
      const result = await toggleFavorite(snippetId);

      if (!result.success) {
        toast.error(result.error || "Failed to update favorite status");
        setIsToggling(false);
        return;
      }

      setCurrentFavorite(!currentFavorite);
      toast.success(
        currentFavorite ? "Removed from favorites" : "Added to favorites"
      );
      router.refresh();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Button
      variant={currentFavorite ? "default" : variant}
      size={size}
      onClick={handleToggle}
      disabled={isToggling}
      className={cn(
        "gap-2",
        currentFavorite &&
          "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 border-yellow-500/20"
      )}
    >
      <Star
        className={cn(
          "size-4",
          currentFavorite && "fill-yellow-500 text-yellow-500"
        )}
      />
      {size !== "icon" && (
        <span>{currentFavorite ? "Favorited" : "Favorite"}</span>
      )}
    </Button>
  );
}
