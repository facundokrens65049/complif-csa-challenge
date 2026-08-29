import { isFilled } from "@/lib/copy-slots";
import { cn } from "@/lib/utils";

export function ReasonSlot({
  label,
  body,
  pendingLabel,
  pendingBody,
  className,
}: {
  label: string;
  body: string;
  pendingLabel: string;
  pendingBody: string;
  className?: string;
}) {
  const filled = isFilled(body);

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl p-4 sm:p-5",
        filled ? "bg-card shadow-[var(--shadow-card)]" : "reason-slot",
        className,
      )}
    >
      <p className="text-[11px] tracking-wider text-primary uppercase">
        {filled ? label : pendingLabel}
      </p>
      <p
        className={
          filled
            ? "mt-2 text-sm leading-relaxed whitespace-pre-wrap"
            : "mt-2 text-sm leading-relaxed text-muted-foreground"
        }
      >
        {filled ? body : pendingBody}
      </p>
    </div>
  );
}
