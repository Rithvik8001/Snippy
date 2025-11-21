import type { ReactNode } from "react";
import { Navbar } from "./navbar";

interface LandingContainerProps {
  children: ReactNode;
}

export function LandingContainer({ children }: LandingContainerProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl border-x border-border transition-colors duration-300">
        <Navbar />
        {children}
      </main>
    </div>
  );
}
