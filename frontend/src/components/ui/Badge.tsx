import * as React from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "critical" | "ai";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-secondary text-text-secondary border-border",
    success:
      "bg-semantic-success/10 text-semantic-success border-semantic-success/20",
    warning:
      "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20",
    critical:
      "bg-semantic-critical/10 text-semantic-critical border-semantic-critical/20",
    ai: "bg-accent-ai/10 text-accent-ai border-accent-ai/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}