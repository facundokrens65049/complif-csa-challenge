import { describe, expect, it } from "vitest";
import { copy } from "@/lib/i18n";
import {
  diagramSteps,
  missingOnboardingCopy,
  nodesByLane,
  onboardingFlow,
  startNode,
} from "@/lib/onboarding-flow";

describe("startNode", () => {
  it("starts at the advisor outreach event", () => {
    // Arrange
    const flow = onboardingFlow;

    // Act
    const start = startNode(flow);

    // Assert
    expect(start).toMatchObject({
      id: "start",
      kind: "start",
      lanes: ["advisor"],
    });
  });
});

describe("nodesByLane", () => {
  it("keeps each team’s tasks in its own lane", () => {
    // Arrange
    const flow = onboardingFlow;

    // Act
    const lanes = nodesByLane(flow);
    const ids = {
      advisor: lanes.advisor.map((node) => node.id),
      representative: lanes.consumer.map((node) => node.id),
      legal: lanes.legal.map((node) => node.id),
      institutional: lanes.institutional.map((node) => node.id),
      pyme: lanes.pyme.map((node) => node.id),
      dataEntry: lanes["data-entry"].map((node) => node.id),
    };

    // Assert
    expect(ids.advisor).toEqual([
      "start",
      "intent",
      "close",
      "closeEnd",
      "formPartial",
      "requireFields",
      "requireDocs",
      "riskMatrix",
      "riskLevel",
      "welcome",
    ]);
    expect(ids.representative).toEqual([
      "formComplete",
      "termsReview",
      "acceptTerms",
      "provideDocs",
      "provideMissing",
    ]);
    expect(ids.legal).toContain("reviewDocs");
    expect(ids.legal).toContain("txProfile");
    expect(ids.institutional).toEqual(["toInstitutional", "approve"]);
    expect(ids.pyme).toEqual(["toPyme", "approve"]);
    expect(ids.dataEntry).toEqual([
      "toDataEntry",
      "reviewInfo",
      "infoCorrect",
      "requireRevision",
      "loadCore",
      "coreEnd",
    ]);
  });
});

describe("diagramSteps", () => {
  it("walks the happy path and hangs forks, rejects and loops off gateways", () => {
    // Arrange
    const flow = onboardingFlow;

    // Act
    const steps = diagramSteps(flow);
    const ids = steps.map((step) => step.node.id);
    const byId = Object.fromEntries(
      steps.map((step) => [step.node.id, step]),
    );

    // Assert
    expect(ids).toEqual([
      "start",
      "intent",
      "formPartial",
      "requireFields",
      "formComplete",
      "termsReview",
      "acceptTerms",
      "requireDocs",
      "provideDocs",
      "riskMatrix",
      "riskLevel",
      "missingDocs",
      "reviewDocs",
      "docsValid",
      "txProfile",
      "uvaLimit",
      "approve",
      "welcome",
      "toDataEntry",
      "reviewInfo",
      "infoCorrect",
      "loadCore",
      "coreEnd",
    ]);
    expect(byId.intent.reject).toEqual({ edgeId: "intent-no", to: "close" });
    expect(byId.acceptTerms.noteIds).toEqual(["termsNote"]);
    expect(byId.riskLevel.forks?.map((fork) => fork.to)).toEqual([
      "toAnalysts",
      "toLegalLead",
    ]);
    expect(byId.missingDocs.side).toEqual({
      edgeId: "missing-yes",
      to: "requireMissing",
    });
    expect(byId.docsValid.loop).toEqual({
      edgeId: "valid-no",
      to: "requireMissing",
    });
    expect(byId.uvaLimit.forks?.map((fork) => fork.to)).toEqual([
      "toInstitutional",
      "toPyme",
    ]);
    expect(byId.approve.reject).toEqual({ edgeId: "approve-no", to: "close" });
    expect(byId.infoCorrect.loop).toEqual({
      edgeId: "correct-no",
      to: "requireRevision",
    });
  });
});

describe("missingOnboardingCopy", () => {
  it("returns no gaps when Spanish and English cover the diagram", () => {
    // Arrange
    const maps = [
      { locale: "es", copy: copy("es").processesII },
      { locale: "en", copy: copy("en").processesII },
    ];

    // Act
    const gaps = maps.flatMap((entry) =>
      missingOnboardingCopy(onboardingFlow, {
        lanes: entry.copy.lanes,
        nodes: entry.copy.nodes,
        edges: entry.copy.edges,
        notes: entry.copy.notes,
      }).map((key) => `${entry.locale}:${key}`),
    );

    // Assert
    expect(gaps).toEqual([]);
  });
});
