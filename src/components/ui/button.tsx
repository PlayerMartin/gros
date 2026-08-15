import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

/* Monochrome chrome: the primary action is ink-on-ivory, every other action is
   a hairline. Gold and ember are reserved for money figures. */
const variants: Record<Variant, string> = {
  primary:
    "bg-foreground text-background font-semibold hover:bg-foreground/90 active:scale-[0.98]",
  secondary:
    "border border-border bg-surface text-foreground hover:border-border-strong hover:bg-surface-2 active:scale-[0.98]",
  ghost: "bg-transparent text-muted hover:text-foreground hover:bg-surface-2/60",
  danger: "bg-expense/12 text-expense hover:bg-expense/25",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-lg",
  md: "h-11 px-4 text-sm rounded-xl",
  lg: "h-12 px-5 text-base rounded-xl",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}