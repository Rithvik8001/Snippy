import { LandingSection } from "./landing-section";
import { AIFeatureItem } from "./ai-feature-item";

const aiFeatures = [
  {
    title: "Explain Code",
    description:
      "Get concise explanations of what your code snippets do, with breakdowns of key parts and potential caveats.",
  },
  {
    title: "Convert Between Languages",
    description:
      "Transform TypeScript to JavaScript, Python to TypeScript, or any language conversion you need—preserving logic and structure.",
  },
  {
    title: "Natural Language Search",
    description:
      "Describe what you're looking for in plain English. AI understands your intent and finds the right snippet.",
  },
] as const;

export function AIFeaturesSection() {
  return (
    <LandingSection className="px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="animate-fade-in-up text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Enhanced with AI
          </h2>
          <p className="mt-4 text-muted-foreground">
            AI features that make your snippets more useful
          </p>
        </div>

        <div className="group/container space-y-6 rounded-lg border border-border bg-muted/30 p-6 transition-all duration-300 hover:border-primary/20 hover:bg-muted/40 hover:shadow-sm">
          {aiFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-fade-in-left"
              style={{
                animationDelay: `${index * 150}ms`,
                opacity: 0,
              }}
            >
              <AIFeatureItem
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}

