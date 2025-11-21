import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface LandingSectionProps {
  children: ReactNode;
  className?: string;
}

export function LandingSection({ children, className }: LandingSectionProps) {
  return (
    <section
      className={cn("border-b border-border py-16 last:border-b-0", className)}
    >
      {children}
    </section>
  );
}

