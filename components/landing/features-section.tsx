import { LandingSection } from "./landing-section";
import { FeatureCard } from "./feature-card";
import { Code2, FileText, Terminal } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Code Snippets",
    description:
      "Save reusable code blocks with language and framework tags. Perfect for authentication helpers, custom hooks, and utilities.",
  },
  {
    icon: FileText,
    title: "Text Snippets",
    description:
      "Store notes, templates, and documentation snippets. PR templates, README sections, or any reusable text.",
  },
  {
    icon: Terminal,
    title: "Command Snippets",
    description:
      "Keep CLI commands at your fingertips. Docker commands, git aliases, deployment scripts—never forget that command again.",
  },
] as const;

export function FeaturesSection() {
  return (
    <LandingSection className="px-8">
      <div className="mx-auto max-w-2xl space-y-12">
        <div className="animate-fade-in-up text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Everything you need, organized
          </h2>
          <p className="mt-4 text-muted-foreground">
            Three snippet types to cover all your developer needs
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </LandingSection>
  );
}

