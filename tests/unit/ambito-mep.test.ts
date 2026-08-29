import { describe, expect, it } from "vitest";
import {
  AMBITO_MEP_CLOSE_ENDPOINT,
  AMBITO_MEP_CLOSE_EXAMPLE_FROM,
  AMBITO_MEP_CLOSE_EXAMPLE_UNTIL,
  AMBITO_MEP_CLOSE_SAMPLE,
  ambitoMepCloseExampleUrl,
  ambitoMepCloseSampleJson,
} from "@/lib/ambito-mep";

describe("ambitoMepCloseExampleUrl", () => {
  it("joins historico-general with an exclusive until date", () => {
    // Arrange
    const endpoint = AMBITO_MEP_CLOSE_ENDPOINT;
    const from = AMBITO_MEP_CLOSE_EXAMPLE_FROM;
    const until = AMBITO_MEP_CLOSE_EXAMPLE_UNTIL;

    // Act
    const url = ambitoMepCloseExampleUrl();

    // Assert
    expect(endpoint).toMatch(/historico-general$/);
    expect(endpoint).not.toMatch(/grafico/);
    expect(from).toBe("2026-07-01");
    expect(until).toBe("2026-07-08");
    expect(url).toBe(`${endpoint}/${from}/${until}`);
  });
});

describe("ambitoMepCloseSampleJson", () => {
  it("serializes the header and July 2026 closes as text values", () => {
    // Arrange
    const sample = AMBITO_MEP_CLOSE_SAMPLE;

    // Act
    const json = ambitoMepCloseSampleJson();
    const parsed = JSON.parse(json) as unknown;

    // Assert
    expect(sample[0]).toEqual(["Fecha", "Referencia"]);
    expect(sample.map((row) => row[0])).toEqual([
      "Fecha",
      "07/07/2026",
      "06/07/2026",
      "03/07/2026",
      "02/07/2026",
      "01/07/2026",
    ]);
    expect(sample.map((row) => row[1])).toEqual([
      "Referencia",
      "1529,19",
      "1525,47",
      "1524,53",
      "1529,77",
      "1521,03",
    ]);
    expect(parsed).toEqual(sample);
    expect(json).toMatch(/"07\/07\/2026"/);
    expect(json).not.toMatch(/DOLAR MEP/);
  });
});
