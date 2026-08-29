import { FlowSteps } from "@/components/flow-steps";
import { ReasonSlot } from "@/components/reason-slot";
import { isFilled, type CopyPrompt } from "@/lib/copy-slots";
import { cn } from "@/lib/utils";

export function PromptCard({
  item,
  pendingLabel,
  pendingFlowLabel,
  pendingBody,
  className,
}: {
  item: CopyPrompt;
  pendingLabel: string;
  pendingFlowLabel: string;
  pendingBody: string;
  className?: string;
}) {
  const hasFlow = item.steps !== undefined;
  const showReason =
    !hasFlow || (item.steps?.length ?? 0) > 0 || isFilled(item.a);

  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5",
        className,
      )}
    >
      <p className="font-mono text-xs text-primary">{item.k}</p>
      <h3 className="text-sm font-semibold sm:text-base">
        {item.t ?? "\u00a0"}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {item.q}
      </p>
      <div className="flex h-full min-h-[7rem] flex-1 flex-col lg:min-h-0 print:min-h-0">
        {hasFlow ? (
          <FlowSteps
            steps={item.steps ?? []}
            pendingLabel={pendingFlowLabel}
            pendingBody={pendingBody}
            className="flex-1"
          />
        ) : null}
        {showReason ? (
          <ReasonSlot
            label={pendingLabel}
            body={item.a}
            pendingLabel={pendingLabel}
            pendingBody={pendingBody}
            className={hasFlow ? "mt-4 flex-1" : "flex-1"}
          />
        ) : null}
      </div>
    </article>
  );
}
