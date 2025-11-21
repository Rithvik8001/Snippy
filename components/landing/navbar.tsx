"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="px-6">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 font-semibold text-foreground transition-all duration-300 hover:text-primary"
          >
            <div className="flex size-8 items-center justify-center rounded-md border border-border bg-muted/50 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:shadow-sm">
              <Logo
                size={18}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className="font-lavishly-yours text-3xl font-normal">
              Snippy
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="transition-all duration-300 hover:scale-105"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
            <div className="sm:hidden">
              <Button
                asChild
                size="sm"
                className="transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
