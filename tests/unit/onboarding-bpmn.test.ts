import { describe, expect, it } from "vitest";
import {
  BPMN_LANE_BY_ID,
  BPMN_NODE_BY_ID,
  BPMN_NOTE_BY_ID,
  localizeOnboardingBpmn,
} from "@/lib/bpmn-labels";
import { copy } from "@/lib/i18n";
import {
  onboardingBpmnAnnotations,
  onboardingBpmnEventNames,
  onboardingBpmnGatewayNames,
  onboardingBpmnOverlaps,
  onboardingBpmnTaskNames,
  readOnboardingBpmn,
} from "@/lib/onboarding-bpmn";
import { onboardingFlow } from "@/lib/onboarding-flow";

describe("readOnboardingBpmn", () => {
  it("loads the Camunda model with BPMN component types", async () => {
    // Arrange
    // Act
    const xml = await readOnboardingBpmn();

    // Assert
    expect(xml).toMatch(/<bpmn:startEvent /);
    expect(xml).toMatch(/<bpmn:endEvent /);
    expect(xml).toMatch(/<bpmn:exclusiveGateway /);
    expect(xml).toMatch(/<bpmn:userTask /);
    expect(xml).toMatch(/<bpmn:sendTask /);
    expect(xml).toMatch(/<bpmn:serviceTask /);
    expect(xml).toMatch(/<bpmn:textAnnotation /);
    expect(xml).toMatch(/<bpmn:sequenceFlow /);
    expect(xml).toMatch(/<bpmn:collaboration /);
    expect(xml).toMatch(/<bpmn:lane /);
    expect(xml).not.toMatch(/<bpmn:task /);
  });
});

describe("onboardingBpmnTaskNames", () => {
  it("keeps Camunda-style infinitive labels that fit inside the tasks", async () => {
    // Arrange
    const xml = await readOnboardingBpmn();

    // Act
    const names = onboardingBpmnTaskNames(xml);

    // Assert
    expect(names.length).toBeGreaterThan(10);
    expect(names.every((name) => name.length <= 38)).toBe(true);
    expect(names.some((name) => /por parte de/i.test(name))).toBe(false);
    expect(names.some((name) => name.endsWith("."))).toBe(false);
    expect(names.some((name) => /^[a-z]/.test(name))).toBe(false);
    expect(names).toContain("Calcular matriz de riesgo");
    expect(names).toContain("Revisar términos y condiciones");
    expect(names).toContain("Cargar datos en el CORE");
  });
});

describe("onboardingBpmnGatewayNames", () => {
  it("asks a question at each exclusive gateway", async () => {
    // Arrange
    const xml = await readOnboardingBpmn();

    // Act
    const names = onboardingBpmnGatewayNames(xml);

    // Assert
    expect(names.length).toBeGreaterThan(5);
    expect(names.every((name) => name.startsWith("¿") && name.endsWith("?"))).toBe(
      true,
    );
    expect(names).toContain("¿El riesgo es bajo o medio?");
    expect(names).toContain("¿Toda la información es correcta?");
  });
});

describe("onboardingBpmnEventNames", () => {
  it("names start and end events as business states", async () => {
    // Arrange
    const xml = await readOnboardingBpmn();

    // Act
    const names = onboardingBpmnEventNames(xml);

    // Assert
    expect(names).toEqual([
      "Contacto comercial iniciado",
      "Caso cerrado",
      "Cuenta abierta",
    ]);
  });
});

describe("onboardingBpmnLanes", () => {
  it("separates each team on its own horizontal lane", async () => {
    // Arrange
    const xml = await readOnboardingBpmn();

    // Act
    const names = [
      ...xml.matchAll(/<bpmn:lane id="[^"]+" name="([^"]+)"/g),
    ].map((match) => match[1]);

    // Assert
    expect(names).toEqual([
      "Asesor comercial",
      "Representante cliente",
      "Legales",
      "Clientes institucionales",
      "Clientes PYMEs",
      "Data entry",
    ]);
  });
});

describe("onboardingBpmnOverlaps", () => {
  it("keeps shapes and labels from covering each other", async () => {
    // Arrange
    const xml = await readOnboardingBpmn();

    // Act
    const overlaps = onboardingBpmnOverlaps(xml);

    // Assert
    expect(overlaps).toEqual([]);
  });
});

describe("onboardingBpmnAnnotations", () => {
  it("keeps the terms assumption as a note, not a task", async () => {
    // Arrange
    const xml = await readOnboardingBpmn();

    // Act
    const notes = onboardingBpmnAnnotations(xml);
    const tasks = onboardingBpmnTaskNames(xml);

    // Assert
    expect(notes).toEqual([
      "Asumo que los términos y condiciones no son negociables",
    ]);
    expect(tasks.some((name) => /asumo/i.test(name))).toBe(false);
  });
});

describe("localizeOnboardingBpmn", () => {
  it("maps every Camunda id to the onboarding copy", () => {
    // Arrange
    const flowNodeIds = onboardingFlow.nodes
      .filter((node) => node.kind !== "note")
      .map((node) => node.id)
      .sort();
    const flowLaneIds = [
      "advisor",
      "consumer",
      "legal",
      "institutional",
      "pyme",
      "data-entry",
    ];
    const flowNoteIds = onboardingFlow.notes.map((note) => note.id).sort();

    // Act
    const mappedNodes = Object.values(BPMN_NODE_BY_ID).sort();
    const mappedLanes = Object.values(BPMN_LANE_BY_ID);
    const mappedNotes = Object.values(BPMN_NOTE_BY_ID).sort();

    // Assert
    expect(mappedNodes).toEqual(flowNodeIds);
    expect(mappedLanes).toEqual(flowLaneIds);
    expect(mappedNotes).toEqual(flowNoteIds);
  });

  it("rewrites visible labels into English and keeps Spanish when asked", async () => {
    // Arrange
    const xml = await readOnboardingBpmn();
    const en = copy("en").processesII;
    const es = copy("es").processesII;

    // Act
    const english = localizeOnboardingBpmn(xml, {
      pool: en.pool,
      yes: en.legend.yes,
      no: en.legend.no,
      lanes: en.lanes,
      nodes: en.nodes,
      notes: en.notes,
    });
    const spanish = localizeOnboardingBpmn(xml, {
      pool: es.pool,
      yes: es.legend.yes,
      no: es.legend.no,
      lanes: es.lanes,
      nodes: es.nodes,
      notes: es.notes,
    });

    // Assert
    expect(onboardingBpmnTaskNames(english)).toContain("Thank and close the case");
    expect(onboardingBpmnTaskNames(english)).not.toContain(
      "Agradecer y cerrar el caso",
    );
    expect(onboardingBpmnGatewayNames(english)).toContain(
      "Is there commercial intent?",
    );
    expect(onboardingBpmnEventNames(english)).toEqual([
      "Commercial outreach started",
      "Case closed",
      "Account opened",
    ]);
    expect(english).toContain('name="Commercial advisor"');
    expect(english).toContain('name="Yes"');
    expect(english).not.toContain('name="Sí"');
    expect(onboardingBpmnAnnotations(english)).toEqual([
      en.notes.termsNote,
    ]);
    expect(onboardingBpmnTaskNames(english).every((name) => name.length <= 38)).toBe(
      true,
    );
    expect(onboardingBpmnTaskNames(spanish)).toContain("Agradecer y cerrar el caso");
    expect(spanish).toContain('name="Sí"');
    expect(spanish).toContain('name="Asesor comercial"');
  });
});
