export const ONBOARDING_LANE_IDS = [
  "advisor",
  "consumer",
  "legal",
  "institutional",
  "pyme",
  "data-entry",
] as const;

export type OnboardingLaneId = (typeof ONBOARDING_LANE_IDS)[number];

export type OnboardingNodeKind =
  | "start"
  | "task"
  | "gateway"
  | "end"
  | "note";

export type OnboardingTaskKind = "user" | "service" | "send";

export type OnboardingOutcome = "yes" | "no" | "next";

export type OnboardingRoute = "continue" | "reject" | "loop" | "fork" | "side";

export type OnboardingNode = {
  id: string;
  kind: OnboardingNodeKind;
  lanes: OnboardingLaneId[];
  task?: OnboardingTaskKind;
};

export type OnboardingEdge = {
  id: string;
  from: string;
  to: string;
  outcome: OnboardingOutcome;
  route: OnboardingRoute;
};

export type OnboardingNote = {
  id: string;
  attachedTo: string;
};

export type OnboardingFlow = {
  nodes: OnboardingNode[];
  edges: OnboardingEdge[];
  notes: OnboardingNote[];
};

export type OnboardingNodeCopy = {
  t: string;
  d: string;
};

export type OnboardingCopy = {
  lanes: Record<OnboardingLaneId, string>;
  nodes: Record<string, OnboardingNodeCopy>;
  edges: Record<string, string>;
  notes: Record<string, string>;
};

export type DiagramFork = {
  edgeId: string;
  to: string;
};

export type DiagramBranch = {
  edgeId: string;
  to: string;
};

export type DiagramStep = {
  node: OnboardingNode;
  reject?: DiagramBranch;
  side?: DiagramBranch;
  loop?: DiagramBranch;
  forks?: DiagramFork[];
  noteIds: string[];
};

function nodeById(flow: OnboardingFlow, id: string): OnboardingNode {
  const node = flow.nodes.find((item) => item.id === id);
  if (!node) {
    throw new Error(`Unknown onboarding node: ${id}`);
  }
  return node;
}

export function startNode(flow: OnboardingFlow): OnboardingNode {
  const start = flow.nodes.find((node) => node.kind === "start");
  if (!start) {
    throw new Error("Onboarding flow has no start event");
  }
  return start;
}

export function outgoing(flow: OnboardingFlow, from: string): OnboardingEdge[] {
  return flow.edges.filter((edge) => edge.from === from);
}

export function nodesByLane(
  flow: OnboardingFlow,
): Record<OnboardingLaneId, OnboardingNode[]> {
  const grouped = Object.fromEntries(
    ONBOARDING_LANE_IDS.map((lane) => [lane, [] as OnboardingNode[]]),
  ) as Record<OnboardingLaneId, OnboardingNode[]>;

  for (const node of flow.nodes) {
    if (node.kind === "note") continue;
    for (const lane of node.lanes) {
      grouped[lane].push(node);
    }
  }
  return grouped;
}

function forkMergeId(flow: OnboardingFlow, forks: OnboardingEdge[]): string {
  const targets = forks.map((edge) => {
    const next = outgoing(flow, edge.to).find(
      (item) => item.route === "continue",
    );
    if (!next) {
      throw new Error(`Fork target ${edge.to} has no continue edge`);
    }
    return next.to;
  });
  const merge = targets[0];
  if (!merge || targets.some((id) => id !== merge)) {
    throw new Error("Fork branches do not merge");
  }
  return merge;
}

export function diagramSteps(flow: OnboardingFlow): DiagramStep[] {
  const steps: DiagramStep[] = [];
  const seen = new Set<string>();
  const skip = new Set<string>();
  let current: string | undefined = startNode(flow).id;

  while (current) {
    if (seen.has(current) || skip.has(current)) break;
    seen.add(current);

    const node = nodeById(flow, current);
    const edges = outgoing(flow, current);
    const reject = edges.find((edge) => edge.route === "reject");
    const side = edges.find((edge) => edge.route === "side");
    const loop = edges.find((edge) => edge.route === "loop");
    const forks = edges.filter((edge) => edge.route === "fork");
    const cont = edges.find((edge) => edge.route === "continue");

    if (side) skip.add(side.to);
    for (const fork of forks) skip.add(fork.to);

    steps.push({
      node,
      reject: reject
        ? { edgeId: reject.id, to: reject.to }
        : undefined,
      side: side ? { edgeId: side.id, to: side.to } : undefined,
      loop: loop ? { edgeId: loop.id, to: loop.to } : undefined,
      forks: forks.length
        ? forks.map((edge) => ({ edgeId: edge.id, to: edge.to }))
        : undefined,
      noteIds: flow.notes
        .filter((note) => note.attachedTo === node.id)
        .map((note) => note.id),
    });

    if (node.kind === "end") break;

    if (forks.length >= 2) {
      current = forkMergeId(flow, forks);
      continue;
    }

    current = cont?.to;
  }

  return steps;
}

export function missingOnboardingCopy(
  flow: OnboardingFlow,
  copy: OnboardingCopy,
): string[] {
  const missing: string[] = [];

  for (const lane of ONBOARDING_LANE_IDS) {
    if (!copy.lanes[lane]?.trim()) missing.push(`lane:${lane}`);
  }
  for (const node of flow.nodes) {
    if (node.kind === "note") continue;
    const nodeCopy = copy.nodes[node.id];
    if (!nodeCopy?.t?.trim() || !nodeCopy.d?.trim()) {
      missing.push(`node:${node.id}`);
    }
  }
  for (const edge of flow.edges) {
    if (edge.outcome === "next") continue;
    if (!copy.edges[edge.id]?.trim()) missing.push(`edge:${edge.id}`);
  }
  for (const note of flow.notes) {
    if (!copy.notes[note.id]?.trim()) missing.push(`note:${note.id}`);
  }
  return missing;
}

export const onboardingFlow: OnboardingFlow = {
  nodes: [
    { id: "start", kind: "start", lanes: ["advisor"] },
    { id: "intent", kind: "gateway", lanes: ["advisor"] },
    { id: "close", kind: "task", lanes: ["advisor"], task: "user" },
    { id: "closeEnd", kind: "end", lanes: ["advisor"] },
    { id: "formPartial", kind: "task", lanes: ["advisor"], task: "user" },
    { id: "requireFields", kind: "task", lanes: ["advisor"], task: "send" },
    {
      id: "formComplete",
      kind: "task",
      lanes: ["consumer"],
      task: "user",
    },
    {
      id: "termsReview",
      kind: "task",
      lanes: ["consumer"],
      task: "user",
    },
    { id: "acceptTerms", kind: "gateway", lanes: ["consumer"] },
    { id: "requireDocs", kind: "task", lanes: ["advisor"], task: "send" },
    {
      id: "provideDocs",
      kind: "task",
      lanes: ["consumer"],
      task: "user",
    },
    { id: "riskMatrix", kind: "task", lanes: ["advisor"], task: "service" },
    { id: "riskLevel", kind: "gateway", lanes: ["advisor"] },
    { id: "toAnalysts", kind: "task", lanes: ["legal"], task: "send" },
    { id: "toLegalLead", kind: "task", lanes: ["legal"], task: "send" },
    { id: "missingDocs", kind: "gateway", lanes: ["legal"] },
    { id: "requireMissing", kind: "task", lanes: ["legal"], task: "send" },
    {
      id: "provideMissing",
      kind: "task",
      lanes: ["consumer"],
      task: "user",
    },
    { id: "reviewDocs", kind: "task", lanes: ["legal"], task: "user" },
    { id: "docsValid", kind: "gateway", lanes: ["legal"] },
    { id: "txProfile", kind: "task", lanes: ["legal"], task: "service" },
    { id: "uvaLimit", kind: "gateway", lanes: ["legal"] },
    {
      id: "toInstitutional",
      kind: "task",
      lanes: ["institutional"],
      task: "send",
    },
    { id: "toPyme", kind: "task", lanes: ["pyme"], task: "send" },
    {
      id: "approve",
      kind: "gateway",
      lanes: ["institutional", "pyme"],
    },
    { id: "welcome", kind: "task", lanes: ["advisor"], task: "user" },
    { id: "toDataEntry", kind: "task", lanes: ["data-entry"], task: "send" },
    { id: "reviewInfo", kind: "task", lanes: ["data-entry"], task: "user" },
    { id: "infoCorrect", kind: "gateway", lanes: ["data-entry"] },
    {
      id: "requireRevision",
      kind: "task",
      lanes: ["data-entry"],
      task: "send",
    },
    { id: "loadCore", kind: "task", lanes: ["data-entry"], task: "user" },
    { id: "coreEnd", kind: "end", lanes: ["data-entry"] },
  ],
  notes: [{ id: "termsNote", attachedTo: "acceptTerms" }],
  edges: [
    {
      id: "start-next",
      from: "start",
      to: "intent",
      outcome: "next",
      route: "continue",
    },
    {
      id: "intent-yes",
      from: "intent",
      to: "formPartial",
      outcome: "yes",
      route: "continue",
    },
    {
      id: "intent-no",
      from: "intent",
      to: "close",
      outcome: "no",
      route: "reject",
    },
    {
      id: "close-end",
      from: "close",
      to: "closeEnd",
      outcome: "next",
      route: "continue",
    },
    {
      id: "form-next",
      from: "formPartial",
      to: "requireFields",
      outcome: "next",
      route: "continue",
    },
    {
      id: "fields-next",
      from: "requireFields",
      to: "formComplete",
      outcome: "next",
      route: "continue",
    },
    {
      id: "complete-next",
      from: "formComplete",
      to: "termsReview",
      outcome: "next",
      route: "continue",
    },
    {
      id: "terms-next",
      from: "termsReview",
      to: "acceptTerms",
      outcome: "next",
      route: "continue",
    },
    {
      id: "accept-yes",
      from: "acceptTerms",
      to: "requireDocs",
      outcome: "yes",
      route: "continue",
    },
    {
      id: "accept-no",
      from: "acceptTerms",
      to: "close",
      outcome: "no",
      route: "reject",
    },
    {
      id: "docs-next",
      from: "requireDocs",
      to: "provideDocs",
      outcome: "next",
      route: "continue",
    },
    {
      id: "docs-delivered",
      from: "provideDocs",
      to: "riskMatrix",
      outcome: "next",
      route: "continue",
    },
    {
      id: "risk-next",
      from: "riskMatrix",
      to: "riskLevel",
      outcome: "next",
      route: "continue",
    },
    {
      id: "risk-yes",
      from: "riskLevel",
      to: "toAnalysts",
      outcome: "yes",
      route: "fork",
    },
    {
      id: "risk-no",
      from: "riskLevel",
      to: "toLegalLead",
      outcome: "no",
      route: "fork",
    },
    {
      id: "analysts-next",
      from: "toAnalysts",
      to: "missingDocs",
      outcome: "next",
      route: "continue",
    },
    {
      id: "lead-next",
      from: "toLegalLead",
      to: "missingDocs",
      outcome: "next",
      route: "continue",
    },
    {
      id: "missing-no",
      from: "missingDocs",
      to: "reviewDocs",
      outcome: "no",
      route: "continue",
    },
    {
      id: "missing-yes",
      from: "missingDocs",
      to: "requireMissing",
      outcome: "yes",
      route: "side",
    },
    {
      id: "missing-req-next",
      from: "requireMissing",
      to: "provideMissing",
      outcome: "next",
      route: "continue",
    },
    {
      id: "missing-delivered",
      from: "provideMissing",
      to: "reviewDocs",
      outcome: "next",
      route: "continue",
    },
    {
      id: "review-next",
      from: "reviewDocs",
      to: "docsValid",
      outcome: "next",
      route: "continue",
    },
    {
      id: "valid-yes",
      from: "docsValid",
      to: "txProfile",
      outcome: "yes",
      route: "continue",
    },
    {
      id: "valid-no",
      from: "docsValid",
      to: "requireMissing",
      outcome: "no",
      route: "loop",
    },
    {
      id: "profile-next",
      from: "txProfile",
      to: "uvaLimit",
      outcome: "next",
      route: "continue",
    },
    {
      id: "uva-yes",
      from: "uvaLimit",
      to: "toInstitutional",
      outcome: "yes",
      route: "fork",
    },
    {
      id: "uva-no",
      from: "uvaLimit",
      to: "toPyme",
      outcome: "no",
      route: "fork",
    },
    {
      id: "institutional-next",
      from: "toInstitutional",
      to: "approve",
      outcome: "next",
      route: "continue",
    },
    {
      id: "pyme-next",
      from: "toPyme",
      to: "approve",
      outcome: "next",
      route: "continue",
    },
    {
      id: "approve-yes",
      from: "approve",
      to: "welcome",
      outcome: "yes",
      route: "continue",
    },
    {
      id: "approve-no",
      from: "approve",
      to: "close",
      outcome: "no",
      route: "reject",
    },
    {
      id: "welcome-next",
      from: "welcome",
      to: "toDataEntry",
      outcome: "next",
      route: "continue",
    },
    {
      id: "entry-next",
      from: "toDataEntry",
      to: "reviewInfo",
      outcome: "next",
      route: "continue",
    },
    {
      id: "info-next",
      from: "reviewInfo",
      to: "infoCorrect",
      outcome: "next",
      route: "continue",
    },
    {
      id: "correct-yes",
      from: "infoCorrect",
      to: "loadCore",
      outcome: "yes",
      route: "continue",
    },
    {
      id: "correct-no",
      from: "infoCorrect",
      to: "requireRevision",
      outcome: "no",
      route: "loop",
    },
    {
      id: "revision-next",
      from: "requireRevision",
      to: "toDataEntry",
      outcome: "next",
      route: "continue",
    },
    {
      id: "core-end",
      from: "loadCore",
      to: "coreEnd",
      outcome: "next",
      route: "continue",
    },
  ],
};
