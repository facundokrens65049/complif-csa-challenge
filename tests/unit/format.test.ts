import { describe, expect, it } from "vitest";
import {
  formatClock,
  formatMep,
  formatMepAmount,
  formatMepRange,
  formatRange,
  getMepStats,
  isQuotedPrice,
  mepQuotedField,
  mepPriceScaleRange,
  PRICE_SCALE_PAD,
} from "@/lib/format";
import type { MepPoint } from "@/lib/types";

describe("formatMep", () => {
  it("formats a rate with two decimal places in es-AR", () => {
    // Arrange
    const value = 216.87301;

    // Act
    const result = formatMep(value);

    // Assert
    expect(result).toBe("216,87");
  });

  it("honors an explicit digit count", () => {
    // Arrange
    const value = 0.125;

    // Act
    const result = formatMep(value, 3);

    // Assert
    expect(result).toBe("0,125");
  });
});

describe("formatMepAmount", () => {
  it("appends ARS to a formatted rate", () => {
    // Arrange
    const value = 216.87301;

    // Act
    const result = formatMepAmount(value);

    // Assert
    expect(result).toBe("216,87 ARS");
  });

  it("keeps an explicit digit count before ARS", () => {
    // Arrange
    const value = 0.125;

    // Act
    const result = formatMepAmount(value, 3);

    // Assert
    expect(result).toBe("0,125 ARS");
  });
});

describe("formatMepRange", () => {
  it("joins extrema once and suffixes ARS", () => {
    // Arrange
    const min = 216.4;
    const max = 218.1;

    // Act
    const result = formatMepRange(min, max);

    // Assert
    expect(result).toBe("216,4 – 218,1 ARS");
  });
});

describe("formatClock", () => {
  it("returns the original string when the input is not a date", () => {
    // Arrange
    const invalid = "not-a-date";

    // Act
    const result = formatClock(invalid);

    // Assert
    expect(result).toBe(invalid);
  });

  it("formats a valid ISO timestamp in America/Argentina/Buenos_Aires", () => {
    // Arrange
    const iso = "2022-01-25T12:00:50.665-03:00";

    // Act
    const result = formatClock(iso);

    // Assert
    expect(result).toMatch(/12:00:50/);
  });
});

describe("formatRange", () => {
  it("falls back to a raw arrow range when dates are invalid", () => {
    // Arrange
    const from = "bad-from";
    const to = "bad-to";

    // Act
    const result = formatRange(from, to);

    // Assert
    expect(result).toBe("bad-from → bad-to");
  });

  it("includes the ART day and both clocks for a valid interval", () => {
    // Arrange
    const from = "2022-01-25T12:00:50.665-03:00";
    const to = "2022-01-25T15:59:40.431-03:00";

    // Act
    const result = formatRange(from, to);

    // Assert
    expect(result).toContain("2022");
    expect(result).toContain(formatClock(from));
    expect(result).toContain(formatClock(to));
  });
});

describe("getMepStats", () => {
  it("returns null for an empty series", () => {
    // Arrange
    const points: MepPoint[] = [];

    // Act
    const result = getMepStats(points);

    // Assert
    expect(result).toBeNull();
  });

  it("returns extrema, spread, and bounds of the series", () => {
    // Arrange
    const points: MepPoint[] = [
      {
        datetime: "2022-01-25T12:00:00-03:00",
        venta: 218,
        compra: 219,
      },
      {
        datetime: "2022-01-25T15:00:00-03:00",
        venta: 216,
        compra: 217.5,
      },
    ];

    // Act
    const result = getMepStats(points);

    // Assert
    expect(result).toEqual({
      lastVenta: 216,
      lastCompra: 217.5,
      spread: 1.5,
      minVenta: 216,
      maxVenta: 218,
      minCompra: 217.5,
      maxCompra: 219,
      count: 2,
      from: "2022-01-25T12:00:00-03:00",
      to: "2022-01-25T15:00:00-03:00",
    });
  });

  it("ignores zero quotes when computing extrema", () => {
    // Arrange
    const points: MepPoint[] = [
      { datetime: "a", venta: 0, compra: 0 },
      { datetime: "b", venta: 216, compra: 219 },
    ];

    // Act
    const result = getMepStats(points);

    // Assert
    expect(result?.minVenta).toBe(216);
    expect(result?.maxVenta).toBe(216);
    expect(result?.minCompra).toBe(219);
    expect(result?.maxCompra).toBe(219);
  });
});

describe("mepPriceScaleRange", () => {
  it("returns null for an empty series", () => {
    // Arrange
    const points: MepPoint[] = [];

    // Act
    const range = mepPriceScaleRange(points);

    // Assert
    expect(range).toBeNull();
  });

  it("spans min to max of venta and compra with padding", () => {
    // Arrange
    const points: MepPoint[] = [
      { datetime: "a", venta: 216, compra: 219 },
      { datetime: "b", venta: 218, compra: 217.5 },
    ];
    const span = 219 - 216;

    // Act
    const range = mepPriceScaleRange(points);

    // Assert
    expect(range).toEqual({
      from: 216 - span * PRICE_SCALE_PAD,
      to: 219 + span * PRICE_SCALE_PAD,
    });
  });

  it("pads a flat series so the scale is still a range", () => {
    // Arrange
    const points: MepPoint[] = [
      { datetime: "a", venta: 200, compra: 200 },
    ];

    // Act
    const range = mepPriceScaleRange(points);

    // Assert
    expect(range).not.toBeNull();
    expect(range?.from).toBeLessThan(200);
    expect(range?.to).toBeGreaterThan(200);
  });

  it("ignores zero quotes so they do not pin the floor at 0", () => {
    // Arrange
    const points: MepPoint[] = [
      { datetime: "a", venta: 0, compra: 0 },
      { datetime: "b", venta: 216, compra: 219 },
    ];
    const span = 219 - 216;

    // Act
    const range = mepPriceScaleRange(points);

    // Assert
    expect(range).toEqual({
      from: 216 - span * PRICE_SCALE_PAD,
      to: 219 + span * PRICE_SCALE_PAD,
    });
  });
});

describe("isQuotedPrice", () => {
  it("accepts a positive finite quote", () => {
    // Arrange
    const value = 216.87;

    // Act
    const quoted = isQuotedPrice(value);

    // Assert
    expect(quoted).toBe(true);
  });

  it("rejects zero, negative, and non-finite values", () => {
    // Arrange
    const values = [0, -1, Number.NaN, Number.POSITIVE_INFINITY];

    // Act
    const quoted = values.map(isQuotedPrice);

    // Assert
    expect(quoted).toEqual([false, false, false, false]);
  });
});

describe("mepQuotedField", () => {
  it("keeps only points whose field is a valid quote", () => {
    // Arrange
    const points: MepPoint[] = [
      { datetime: "a", venta: 0, compra: 219 },
      { datetime: "b", venta: 216, compra: 0 },
      { datetime: "c", venta: 217, compra: 218 },
    ];

    // Act
    const ventas = mepQuotedField(points, "venta");
    const compras = mepQuotedField(points, "compra");

    // Assert
    expect(ventas).toEqual([
      { datetime: "b", venta: 216, compra: 0 },
      { datetime: "c", venta: 217, compra: 218 },
    ]);
    expect(compras).toEqual([
      { datetime: "a", venta: 0, compra: 219 },
      { datetime: "c", venta: 217, compra: 218 },
    ]);
  });
});
