import { readFile } from "node:fs/promises";
import path from "node:path";

export const ONBOARDING_BPMN_PATH = path.join(
  process.cwd(),
  "docs/cliente-adquisition.bpmn",
);

const TASK_NAME =
  /<bpmn:(?:userTask|sendTask|serviceTask) [^>]*name="([^"]+)"/g;
const GATEWAY_NAME = /<bpmn:exclusiveGateway [^>]*name="([^"]+)"/g;
const EVENT_NAME =
  /<bpmn:(?:startEvent|endEvent) [^>]*name="([^"]+)"/g;
const ANNOTATION_TEXT = /<bpmn:text>([^<]+)<\/bpmn:text>/g;

export async function readOnboardingBpmn(): Promise<string> {
  return readFile(ONBOARDING_BPMN_PATH, "utf8");
}

export function bpmnAttributeNames(
  xml: string,
  pattern: RegExp,
): string[] {
  return [...xml.matchAll(pattern)].map((match) => match[1]);
}

export function onboardingBpmnTaskNames(xml: string): string[] {
  return bpmnAttributeNames(xml, TASK_NAME);
}

export function onboardingBpmnGatewayNames(xml: string): string[] {
  return bpmnAttributeNames(xml, GATEWAY_NAME);
}

export function onboardingBpmnEventNames(xml: string): string[] {
  return bpmnAttributeNames(xml, EVENT_NAME);
}

export function onboardingBpmnAnnotations(xml: string): string[] {
  return bpmnAttributeNames(xml, ANNOTATION_TEXT);
}

export type BpmnBox = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const SHAPE_BLOCK =
  /<bpmndi:BPMNShape id="([^"]+)"[\s\S]*?<\/bpmndi:BPMNShape>/g;
const BOUNDS =
  /<dc:Bounds x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" \/>/g;

export function onboardingBpmnBoxes(xml: string): BpmnBox[] {
  const boxes: BpmnBox[] = [];
  for (const block of xml.matchAll(SHAPE_BLOCK)) {
    const id = block[1];
    const inner = [...block[0].matchAll(BOUNDS)];
    inner.forEach((bounds, index) => {
      boxes.push({
        id: index === 0 ? id : `${id}:label`,
        x: Number(bounds[1]),
        y: Number(bounds[2]),
        w: Number(bounds[3]),
        h: Number(bounds[4]),
      });
    });
  }
  return boxes;
}

function boxesOverlap(a: BpmnBox, b: BpmnBox, gap: number): boolean {
  return (
    a.x < b.x + b.w + gap &&
    a.x + a.w + gap > b.x &&
    a.y < b.y + b.h + gap &&
    a.y + a.h + gap > b.y
  );
}

export function onboardingBpmnOverlaps(
  xml: string,
  gap = 6,
): Array<[string, string]> {
  const boxes = onboardingBpmnBoxes(xml).filter(
    (box) => !/Lane_|Participant_/.test(box.id),
  );
  const hits: Array<[string, string]> = [];
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i];
      const b = boxes[j];
      const sameShape = a.id.replace(/:label$/, "") === b.id.replace(/:label$/, "");
      if (sameShape) continue;
      if (boxesOverlap(a, b, gap)) hits.push([a.id, b.id]);
    }
  }
  return hits;
}
