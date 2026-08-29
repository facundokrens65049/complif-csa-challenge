import { describe, expect, it } from "vitest";
import { copy } from "@/lib/i18n";
import {
  buyBuhoFlow,
  flowLanes,
  missingFlowCopy,
  petstoreFlows,
  renameMonoFlow,
  requestErrorCodes,
  startNode,
} from "@/lib/petstore-flows";

describe("buyBuhoFlow", () => {
  it("starts at POST /user and walks search, client filter, then order", () => {
    // Arrange
    const flow = buyBuhoFlow;

    // Act
    const start = startNode(flow);
    const laneIds = flowLanes(flow).map((lane) => lane.node.id);

    // Assert
    expect(start).toMatchObject({
      id: "user",
      method: "POST",
      path: "/user",
    });
    expect(laneIds).toEqual(["user", "find", "filter", "order", "bought"]);
  });

  it("maps the Swagger error codes of each request", () => {
    // Arrange
    const flow = buyBuhoFlow;

    // Act
    const codes = requestErrorCodes(flow);

    // Assert
    expect(codes).toEqual({
      "POST /user": ["undocumented"],
      "GET /pet/findByStatus": ["400"],
      "POST /store/order": ["400"],
    });
  });
});

describe("renameMonoFlow", () => {
  it("renames with POST /pet/{petId} and only documents 405", () => {
    // Arrange
    const flow = renameMonoFlow;

    // Act
    const laneIds = flowLanes(flow).map((lane) => lane.node.id);
    const codes = requestErrorCodes(flow);

    // Assert
    expect(laneIds).toEqual(["rename", "renamed"]);
    expect(codes).toEqual({
      "POST /pet/{petId}": ["405"],
    });
  });
});

describe("missingFlowCopy", () => {
  it("returns no gaps when Spanish and English cover both graphs", () => {
    // Arrange
    const es = copy("es").apis;
    const en = copy("en").apis;
    const maps = [
      { locale: "es", buy: es.buy, rename: es.rename },
      { locale: "en", buy: en.buy, rename: en.rename },
    ];

    // Act
    const gaps = maps.flatMap((entry) => [
      ...missingFlowCopy(buyBuhoFlow, entry.buy).map(
        (key) => `${entry.locale}:buy:${key}`,
      ),
      ...missingFlowCopy(renameMonoFlow, entry.rename).map(
        (key) => `${entry.locale}:rename:${key}`,
      ),
    ]);

    // Assert
    expect(gaps).toEqual([]);
    expect(petstoreFlows).toHaveLength(2);
  });
});
