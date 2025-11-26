"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  keys?: string[];
}

/**
 * Keyboard shortcut badge component
 * Displays keyboard shortcuts in a styled badge
 */
export function Kbd({ keys, className, ...props }: KbdProps) {
  if (!keys || keys.length === 0) return null;

  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100",
        className
      )}
      {...props}
    >
      {keys.map((key, index) => (
        <span key={index}>
          {key}
          {index < keys.length - 1 && <span className="text-muted-foreground/50">+</span>}
        </span>
      ))}
    </kbd>
  );
}

/**
 * Hook to get platform-specific modifier key
 * Returns "⌘" for Mac, "Ctrl" for Windows/Linux
 */
export function useModifierKey(): string {
  const [modifierKey, setModifierKey] = useState("Ctrl");

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    setModifierKey(isMac ? "⌘" : "Ctrl");
  }, []);

  return modifierKey;
}

/**
 * Component that displays platform-specific modifier key
 */
export function ModifierKey({ className }: { className?: string }) {
  const modifierKey = useModifierKey();
  return <span className={className}>{modifierKey}</span>;
}

