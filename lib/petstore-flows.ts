export type HttpMethod = "GET" | "POST";

export type FlowNodeKind = "request" | "decision" | "ok" | "error";

export type FlowOutcome = "ok" | "error" | "yes" | "no";

export type PetstoreNode = {
  id: string;
  kind: FlowNodeKind;
  method?: HttpMethod;
  path?: string;
};

export type PetstoreEdge = {
  id: string;
  from: string;
  to: string;
  outcome: FlowOutcome;
  code: string;
};

export type PetstoreFlow = {
  id: "buy-buho" | "rename-mono";
  nodes: PetstoreNode[];
  edges: PetstoreEdge[];
};

export type FlowNodeCopy = {
  t: string;
  d: string;
};

export type FlowCopy = {
  nodes: Record<string, FlowNodeCopy>;
  edges: Record<string, string>;
};

export type FlowLane = {
  node: PetstoreNode;
  continue?: { edge: PetstoreEdge; to: PetstoreNode };
  fail?: { edge: PetstoreEdge; to: PetstoreNode };
};

function nodeById(flow: PetstoreFlow, id: string): PetstoreNode {
  const node = flow.nodes.find((item) => item.id === id);
  if (!node) {
    throw new Error(`Unknown flow node: ${id}`);
  }
  return node;
}

export function isContinue(outcome: FlowOutcome): boolean {
  return outcome === "ok" || outcome === "yes";
}

export function isFail(outcome: FlowOutcome): boolean {
  return outcome === "error" || outcome === "no";
}

export function startNode(flow: PetstoreFlow): PetstoreNode {
  const targeted = new Set(flow.edges.map((edge) => edge.to));
  const start = flow.nodes.find((node) => !targeted.has(node.id));
  if (!start) {
    throw new Error(`Flow ${flow.id} has no start node`);
  }
  return start;
}

export function flowLanes(flow: PetstoreFlow): FlowLane[] {
  const lanes: FlowLane[] = [];
  const seen = new Set<string>();
  let current: PetstoreNode | undefined = startNode(flow);

  while (current) {
    const node = current;
    if (seen.has(node.id)) {
      break;
    }
    seen.add(node.id);
    const outgoing = flow.edges.filter((edge) => edge.from === node.id);
    const continueEdge = outgoing.find((edge) => isContinue(edge.outcome));
    const failEdge = outgoing.find((edge) => isFail(edge.outcome));
    const lane: FlowLane = { node };
    if (continueEdge) {
      lane.continue = {
        edge: continueEdge,
        to: nodeById(flow, continueEdge.to),
      };
    }
    if (failEdge) {
      lane.fail = { edge: failEdge, to: nodeById(flow, failEdge.to) };
    }
    lanes.push(lane);

    if (!continueEdge) {
      break;
    }

    const next = nodeById(flow, continueEdge.to);
    if (next.kind === "ok" || next.kind === "error") {
      if (!seen.has(next.id)) {
        lanes.push({ node: next });
      }
      break;
    }
    current = next;
  }

  return lanes;
}

export function requestErrorCodes(
  flow: PetstoreFlow,
): Record<string, string[]> {
  const byRequest: Record<string, string[]> = {};
  for (const node of flow.nodes) {
    if (node.kind !== "request" || !node.method || !node.path) {
      continue;
    }
    const key = `${node.method} ${node.path}`;
    byRequest[key] = flow.edges
      .filter((edge) => edge.from === node.id && isFail(edge.outcome))
      .map((edge) => edge.code);
  }
  return byRequest;
}

export function missingFlowCopy(
  flow: PetstoreFlow,
  copy: FlowCopy,
): string[] {
  const missing: string[] = [];
  for (const node of flow.nodes) {
    const nodeCopy = copy.nodes[node.id];
    if (!nodeCopy?.t?.trim() || !nodeCopy.d?.trim()) {
      missing.push(`node:${node.id}`);
    }
  }
  for (const edge of flow.edges) {
    if (!copy.edges[edge.id]?.trim()) {
      missing.push(`edge:${edge.id}`);
    }
  }
  return missing;
}

export const buyBuhoFlow: PetstoreFlow = {
  id: "buy-buho",
  nodes: [
    { id: "user", kind: "request", method: "POST", path: "/user" },
    { id: "userFail", kind: "error" },
    {
      id: "find",
      kind: "request",
      method: "GET",
      path: "/pet/findByStatus",
    },
    { id: "findFail", kind: "error" },
    { id: "filter", kind: "decision" },
    { id: "filterMiss", kind: "error" },
    { id: "order", kind: "request", method: "POST", path: "/store/order" },
    { id: "orderFail", kind: "error" },
    { id: "bought", kind: "ok" },
  ],
  edges: [
    {
      id: "user-ok",
      from: "user",
      to: "find",
      outcome: "ok",
      code: "default",
    },
    {
      id: "user-err",
      from: "user",
      to: "userFail",
      outcome: "error",
      code: "undocumented",
    },
    {
      id: "find-ok",
      from: "find",
      to: "filter",
      outcome: "ok",
      code: "200",
    },
    {
      id: "find-err",
      from: "find",
      to: "findFail",
      outcome: "error",
      code: "400",
    },
    {
      id: "filter-yes",
      from: "filter",
      to: "order",
      outcome: "yes",
      code: "client-filter",
    },
    {
      id: "filter-no",
      from: "filter",
      to: "filterMiss",
      outcome: "no",
      code: "not-found",
    },
    {
      id: "order-ok",
      from: "order",
      to: "bought",
      outcome: "ok",
      code: "200",
    },
    {
      id: "order-err",
      from: "order",
      to: "orderFail",
      outcome: "error",
      code: "400",
    },
  ],
};

export const renameMonoFlow: PetstoreFlow = {
  id: "rename-mono",
  nodes: [
    {
      id: "rename",
      kind: "request",
      method: "POST",
      path: "/pet/{petId}",
    },
    { id: "renameFail", kind: "error" },
    { id: "renamed", kind: "ok" },
  ],
  edges: [
    {
      id: "rename-ok",
      from: "rename",
      to: "renamed",
      outcome: "ok",
      code: "undocumented",
    },
    {
      id: "rename-err",
      from: "rename",
      to: "renameFail",
      outcome: "error",
      code: "405",
    },
  ],
};

export const petstoreFlows = [buyBuhoFlow, renameMonoFlow] as const;
