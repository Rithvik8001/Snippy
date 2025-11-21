interface AIFeatureItemProps {
  title: string;
  description: string;
}

export function AIFeatureItem({ title, description }: AIFeatureItemProps) {
  return (
    <div className="group space-y-2 transition-all duration-300 hover:translate-x-1">
      <h3 className="font-semibold transition-colors duration-300 group-hover:text-primary">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
        {description}
      </p>
    </div>
  );
}

