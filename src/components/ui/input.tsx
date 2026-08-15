import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const focusRing =
  "outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-foreground/20";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-2",
        focusRing,
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full min-w-0 appearance-none rounded-xl border border-border bg-surface px-3 text-sm text-foreground disabled:opacity-50",
        focusRing,
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-2",
        focusRing,
        className
      )}
      {...props}
    />
  );
}