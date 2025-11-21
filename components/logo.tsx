import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      {...props}
    >
      {/* Main snippet/document shape with rounded corners */}
      <rect
        x="5"
        y="4"
        width="14"
        height="16"
        rx="2"
        className="fill-foreground/8 stroke-foreground/30"
        strokeWidth="1.2"
      />
      
      {/* Code lines - representing snippets */}
      <line
        x1="8"
        y1="9"
        x2="13"
        y2="9"
        className="stroke-foreground/70"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="12"
        x2="16"
        y2="12"
        className="stroke-foreground/70"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="15"
        x2="11"
        y2="15"
        className="stroke-foreground/70"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      
      {/* Cute sparkle accent - positioned on the corner */}
      <path
        d="M16.5 6.5L17 7.2L17.8 7L17.2 7.5L17.8 8L17 7.8L16.5 8.5L16 7.8L15.2 8L15.8 7.5L15.2 7L16 7.2L16.5 6.5Z"
        className="fill-primary"
      />
    </svg>
  );
}

