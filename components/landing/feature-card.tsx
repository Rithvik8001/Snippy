import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export function FeatureCard({ icon: Icon, title, description, index = 0 }: FeatureCardProps) {
  return (
    <div 
      className="group space-y-3 transition-all duration-300 hover:-translate-y-1"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted/50 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:shadow-sm">
        <Icon className="size-6 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:text-primary" />
      </div>
      <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
        {description}
      </p>
    </div>
  );
}

