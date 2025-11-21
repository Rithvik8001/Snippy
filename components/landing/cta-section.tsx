import { Button } from "@/components/ui/button";
import { LandingSection } from "./landing-section";
import Link from "next/link";

export function CTASection() {
  return (
    <LandingSection className="px-8 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight text-foreground">
          Ready to organize your snippets?
        </h2>
        <p className="mt-4 animate-fade-in-up text-lg text-muted-foreground" style={{ animationDelay: "100ms" }}>
          Start building your personal snippet library today.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 animate-fade-in-up sm:flex-row" style={{ animationDelay: "200ms" }}>
          <Button asChild size="lg" className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <Link href="/sign-up">Create Account</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="transition-all duration-300 hover:scale-105 hover:border-primary/50">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </LandingSection>
  );
}

