import { describe, expect, it } from "vitest";
import {
  onboardingBpmnAnnotations,
  onboardingBpmnEventNames,
  onboardingBpmnGatewayNames,
  onboardingBpmnOverlaps,
  onboardingBpmnTaskNames,
  readOnboardingBpmn,
} from "@/lib/onboarding-bpmn";

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
