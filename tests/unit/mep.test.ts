import { afterEach, describe, expect, it } from "vitest";
import { coerceMepRow, getMepSeries, mepSeriesSelectSql, toMepErrorCode } from "@/lib/mep";

const URL_KEY = "NEXT_PUBLIC_DATABASE_URL";
const ANON_KEY = "NEXT_PUBLIC_DATABASE_ANON_KEY";

afterEach(() => {
  delete process.env[URL_KEY];
  delete process.env[ANON_KEY];
});

describe("coerceMepRow", () => {
  it("maps a database row to the MepPoint contract", () => {
    // Arrange
    const row = {
      datetime: "2022-01-25T12:00:50.665-03:00",
      venta: "216.873010",
      compra: 217.328136,
    };

    // Act
    const point = coerceMepRow(row);

    // Assert
    expect(point).toEqual({
      datetime: "2022-01-25T12:00:50.665-03:00",
      venta: 216.87301,
      compra: 217.328136,
    });
  });

  it("coerces non-numeric quotes to 0", () => {
    // Arrange
    const row = { datetime: 1, venta: "n/a", compra: undefined };

    // Act
    const point = coerceMepRow(row);

    // Assert
    expect(point).toEqual({
      datetime: "1",
      venta: 0,
      compra: 0,
    });
  });
});

describe("getMepSeries", () => {
  it("returns the missing-credentials error without calling a database", () => {
    // Arrange
    delete process.env[URL_KEY];
    delete process.env[ANON_KEY];

    // Act
    const pending = getMepSeries();

    // Assert
    return expect(pending).resolves.toEqual({
      points: [],
      error: "missing_credentials",
    });
  });
});

describe("toMepErrorCode", () => {
  it("maps a PostgREST schema-cache failure to unavailable", () => {
    // Arrange
    const message =
      "Could not find the table 'public.mep_implicito' in the schema cache";

    // Act
    const code = toMepErrorCode(message);

    // Assert
    expect(code).toBe("unavailable");
  });
});

describe("mepSeriesSelectSql", () => {
  it("pages the live view with WHERE and LIMIT", () => {
    // Arrange
    const expectedRelation = "mep_implicito";

    // Act
    const sql = mepSeriesSelectSql();

    // Assert
    expect(sql).toContain(`FROM ${expectedRelation}`);
    expect(sql).not.toContain("mep_implicito_mv");
    expect(sql).toMatch(/WHERE datetime >= /);
    expect(sql).toMatch(/LIMIT 5000;/);
    expect(sql).toContain("ORDER BY datetime ASC");
    expect(sql).toContain("SELECT datetime, venta, compra");
  });
});
