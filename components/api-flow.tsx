import { ArrowDown, ArrowRight, CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  flowLanes,
  type FlowCopy,
  type FlowLane,
  type PetstoreFlow,
  type PetstoreNode,
} from "@/lib/petstore-flows";

export function ApiFlow({
  flow,
  copy,
  legendOk,
  legendError,
}: {
  flow: PetstoreFlow;
  copy: FlowCopy;
  legendOk: string;
  legendError: string;
}) {
  const lanes = flowLanes(flow);
  const steps = lanes.filter((lane) => lane.node.kind !== "ok");
  const finish = lanes.find((lane) => lane.node.kind === "ok");

  return (
    <div className="api-flow">
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] tracking-wider uppercase">
        <span className="inline-flex items-center gap-1.5 text-primary">
          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          {legendOk}
        </span>
        <span className="inline-flex items-center gap-1.5 text-destructive">
          <span className="size-1.5 shrink-0 rounded-full bg-destructive" />
          {legendError}
        </span>
      </div>

      <ol className="api-flow-list">
        {steps.map((lane, index) => {
          const continueLabel = lane.continue
            ? copy.edges[lane.continue.edge.id]
            : "";
          const showArrow =
            Boolean(continueLabel) &&
            (index < steps.length - 1 || Boolean(finish));

          return (
            <FlowSegment
              key={lane.node.id}
              lane={lane}
              copy={copy}
              continueLabel={continueLabel}
              showArrow={showArrow}
            />
          );
        })}
        {finish ? (
          <li className="api-flow-step">
            <FlowDot kind="ok" />
            <FlowNode node={finish.node} copy={copy} />
          </li>
        ) : null}
      </ol>
    </div>
  );
}

function FlowSegment({
  lane,
  copy,
  continueLabel,
  showArrow,
}: {
  lane: FlowLane;
  copy: FlowCopy;
  continueLabel: string;
  showArrow: boolean;
}) {
  return (
    <li className="api-flow-step">
      <FlowDot kind={lane.node.kind} />
      <div className={cn("api-flow-row", lane.fail && "api-flow-row-split")}>
        <FlowNode node={lane.node} copy={copy} className="api-flow-main" />
        {lane.fail ? (
          <div className="api-flow-fail">
            <FlowConnector
              label={copy.edges[lane.fail.edge.id]}
              variant="error"
              layout="fail"
            />
            <FlowNode
              node={lane.fail.to}
              copy={copy}
              className="api-flow-fail-node"
            />
          </div>
        ) : null}
      </div>
      {showArrow ? (
        <FlowConnector
          label={continueLabel}
          variant="ok"
          layout="continue"
        />
      ) : null}
    </li>
  );
}

function FlowDot({ kind }: { kind: PetstoreNode["kind"] }) {
  return (
    <span
      className={cn(
        "absolute top-4 -left-[1.375rem] size-2.5 rounded-full ring-4 ring-card sm:-left-[1.625rem]",
        kind === "error" && "bg-destructive",
        kind === "ok" && "bg-primary",
        kind === "decision" && "bg-primary/70",
        kind === "request" && "bg-primary",
      )}
    />
  );
}

function FlowNode({
  node,
  copy,
  className,
}: {
  node: PetstoreNode;
  copy: FlowCopy;
  className?: string;
}) {
  const text = copy.nodes[node.id];
  const kind = node.kind;

  return (
    <div
      className={cn(
        "api-flow-node rounded-2xl p-3 ring-1 sm:p-4",
        kind === "request" && "bg-background ring-foreground/10",
        kind === "decision" && "bg-accent/70 ring-primary/25",
        kind === "ok" && "bg-primary/10 ring-primary/25",
        kind === "error" && "bg-destructive/10 ring-destructive/25",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {kind === "ok" ? (
          <CircleCheck
            className="size-3.5 shrink-0 text-primary"
            strokeWidth={1.75}
          />
        ) : null}
        {kind === "error" ? (
          <CircleAlert
            className="size-3.5 shrink-0 text-destructive"
            strokeWidth={1.75}
          />
        ) : null}
        {node.method ? (
          <span className="font-mono text-[11px] text-primary">
            {node.method}
          </span>
        ) : null}
        {node.path ? (
          <span className="font-mono text-[11px] text-muted-foreground">
            {node.path}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "mt-2 text-sm font-semibold",
          kind === "error" && "text-destructive",
        )}
      >
        {text?.t}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {text?.d}
      </p>
    </div>
  );
}

function FlowConnector({
  label,
  variant,
  layout,
}: {
  label: string;
  variant: "ok" | "error";
  layout: "continue" | "fail";
}) {
  const tone = variant === "ok" ? "text-primary" : "text-destructive";
  const line = variant === "ok" ? "bg-primary/40" : "bg-destructive/40";
  const Arrow = layout === "fail" ? ArrowRight : ArrowDown;

  return (
    <div
      className={cn(
        "api-flow-link",
        layout === "fail" ? "api-flow-fail-link" : "api-flow-continue",
      )}
    >
      <span className={cn("api-flow-line", line)} />
      <span className={cn("font-mono text-[11px]", tone)}>{label}</span>
      <Arrow className={cn("api-flow-arrow size-3.5 shrink-0", tone)} strokeWidth={1.75} />
    </div>
  );
}
