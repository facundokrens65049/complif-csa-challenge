import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SourceLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline",
        className,
      )}
    >
      {children}
      <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
    </a>
  );
}
