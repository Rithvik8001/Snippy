import { Button } from "@/components/ui/button";
import { LandingSection } from "./landing-section";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <LandingSection className="px-8 py-24 text-center">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm transition-all duration-300 hover:border-primary/20 hover:bg-muted">
          <Sparkles className="size-4 animate-pulse" />
          <span>AI-Assisted Snippet Manager</span>
        </div>
        <h1 className="animate-fade-in-up text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Your Personal{" "}
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Snippet Brain
          </span>
        </h1>
        <p className="animate-fade-in-up text-lg text-muted-foreground sm:text-xl" style={{ animationDelay: "100ms" }}>
          Save code, commands, and templates in one place. Search, reuse, and
          enhance them with AI—built for developers who value speed and
          organization.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 pt-4 animate-fade-in-up sm:flex-row" style={{ animationDelay: "200ms" }}>
          <Button asChild size="lg" className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <Link href="/sign-up">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="transition-all duration-300 hover:scale-105 hover:border-primary/50">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </LandingSection>
  );
}

