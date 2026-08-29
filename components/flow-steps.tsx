import type { CopyStep } from "@/lib/copy-slots";
import { ReasonSlot } from "@/components/reason-slot";
import { cn } from "@/lib/utils";

export function FlowSteps({
  steps,
  pendingLabel,
  pendingBody,
  className,
}: {
  steps: CopyStep[];
  pendingLabel: string;
  pendingBody: string;
  className?: string;
}) {
  if (steps.length === 0) {
    return (
      <ReasonSlot
        label={pendingLabel}
        body=""
        pendingLabel={pendingLabel}
        pendingBody={pendingBody}
        className={className}
      />
    );
  }

  return (
    <ol
      className={cn(
        "relative h-full space-y-3 border-l border-border pl-4 sm:pl-5",
        className,
      )}
    >
      {steps.map((step) => (
        <li key={step.k} className="relative">
          <span className="absolute top-1.5 -left-[1.4rem] size-2 rounded-full bg-primary sm:-left-[1.65rem]" />
          <p className="font-mono text-[11px] text-primary">{step.k}</p>
          <p className="mt-0.5 text-sm font-semibold">{step.t}</p>
          {step.d ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {step.d}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
