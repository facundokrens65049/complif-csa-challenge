import { Database } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-md px-4 py-10 text-center sm:px-6 sm:py-12", className)}>
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-accent text-primary">
        <Database className="size-7" strokeWidth={1.75} />
      </div>
      <p className="font-heading text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
