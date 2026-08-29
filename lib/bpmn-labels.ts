import type { OnboardingLaneId } from "@/lib/onboarding-flow";

export type BpmnLabelCopy = {
  pool: string;
  yes: string;
  no: string;
  lanes: Record<OnboardingLaneId, string>;
  nodes: Record<string, { t: string }>;
  notes: Record<string, string>;
};

export const BPMN_PARTICIPANT_ID = "Participant_boquita";

export const BPMN_LANE_BY_ID: Record<string, OnboardingLaneId> = {
  Lane_advisor: "advisor",
  Lane_consumer: "consumer",
  Lane_legal: "legal",
  Lane_institutional: "institutional",
  Lane_pyme: "pyme",
  Lane_data_entry: "data-entry",
};

export const BPMN_NODE_BY_ID: Record<string, string> = {
  StartEvent_1: "start",
  Gateway_1kb7r2w: "intent",
  Activity_1gkhobb: "close",
  Event_close: "closeEnd",
  Activity_061rtr8: "formPartial",
  Activity_1h4tnfn: "requireFields",
  Activity_0haboam: "formComplete",
  Activity_173zmub: "termsReview",
  Gateway_0cqb5g7: "acceptTerms",
  Activity_0clj8e5: "requireDocs",
  Activity_provide_docs: "provideDocs",
  Activity_1mizeyf: "riskMatrix",
  Gateway_0cf7emy: "riskLevel",
  Activity_0wuezpd: "toAnalysts",
  Activity_19sgtqu: "toLegalLead",
  Gateway_0tqfwg5: "missingDocs",
  Activity_1s35gp1: "reviewDocs",
  Activity_0d9oefd: "requireMissing",
  Activity_provide_missing: "provideMissing",
  Gateway_0bggunu: "docsValid",
  Activity_1owg6ex: "txProfile",
  Gateway_055ug9k: "uvaLimit",
  Activity_0yoiv19: "toInstitutional",
  Activity_14212ux: "toPyme",
  Gateway_1beyehc: "approve",
  Activity_17k9lou: "welcome",
  Activity_16a774h: "toDataEntry",
  Activity_04pbzur: "reviewInfo",
  Gateway_0vzicrh: "infoCorrect",
  Activity_18x4bet: "loadCore",
  Event_core: "coreEnd",
  Activity_11u3l9f: "requireRevision",
};

export const BPMN_NOTE_BY_ID: Record<string, string> = {
  Annotation_terms: "termsNote",
};

export function localizeOnboardingBpmn(
  xml: string,
  labels: BpmnLabelCopy,
): string {
  let next = replaceXmlName(xml, BPMN_PARTICIPANT_ID, labels.pool);

  for (const [bpmnId, laneId] of Object.entries(BPMN_LANE_BY_ID)) {
    next = replaceXmlName(next, bpmnId, labels.lanes[laneId]);
  }
  for (const [bpmnId, nodeId] of Object.entries(BPMN_NODE_BY_ID)) {
    next = replaceXmlName(next, bpmnId, labels.nodes[nodeId].t);
  }
  for (const [bpmnId, noteId] of Object.entries(BPMN_NOTE_BY_ID)) {
    next = replaceXmlAnnotation(next, bpmnId, labels.notes[noteId]);
  }

  next = next.replace(
    /(<bpmn:sequenceFlow id="[^"]+" name=")Sí(")/g,
    `$1${escapeXmlAttr(labels.yes)}$2`,
  );
  next = next.replace(
    /(<bpmn:sequenceFlow id="[^"]+" name=")No(")/g,
    `$1${escapeXmlAttr(labels.no)}$2`,
  );

  return next;
}

function replaceXmlName(xml: string, id: string, name: string): string {
  const pattern = new RegExp(`(id="${id}"[^>]*?\\sname=")([^"]*)(")`);
  if (!pattern.test(xml)) {
    throw new Error(`Missing BPMN name for ${id}`);
  }
  return xml.replace(pattern, `$1${escapeXmlAttr(name)}$3`);
}

function replaceXmlAnnotation(
  xml: string,
  id: string,
  text: string,
): string {
  const pattern = new RegExp(
    `(<bpmn:textAnnotation id="${id}"[\\s\\S]*?<bpmn:text>)([^<]*)(<\\/bpmn:text>)`,
  );
  if (!pattern.test(xml)) {
    throw new Error(`Missing BPMN annotation for ${id}`);
  }
  return xml.replace(pattern, `$1${escapeXmlText(text)}$3`);
}

function escapeXmlAttr(value: string): string {
  return escapeXmlText(value).replaceAll('"', "&quot;");
}

function escapeXmlText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
