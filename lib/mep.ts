import { createDatabaseClient } from "@/lib/database/client";
import type { MepErrorCode, MepPoint, MepResult } from "@/lib/types";

function toNumber(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function coerceMepRow(row: Record<string, unknown>): MepPoint {
  return {
    datetime: String(row.datetime),
    venta: toNumber(row.venta),
    compra: toNumber(row.compra),
  };
}

export const MEP_SERIES_RELATION = "mep_implicito";
export const MEP_SERIES_LIMIT = 5000;
export const MEP_SERIES_FROM = "2022-01-25T00:00:00.000-03:00";
export const MEP_SERIES_UNTIL = "2022-01-26T00:00:00.000-03:00";

export function mepSeriesSelectSql() {
  return [
    "SELECT datetime, venta, compra",
    `FROM ${MEP_SERIES_RELATION}`,
    `WHERE datetime >= '${MEP_SERIES_FROM}'`,
    `  AND datetime < '${MEP_SERIES_UNTIL}'`,
    "ORDER BY datetime ASC",
    `LIMIT ${MEP_SERIES_LIMIT};`,
  ].join("\n");
}

export function toMepErrorCode(_clientMessage: string): MepErrorCode {
  return "unavailable";
}

export async function getMepSeries(): Promise<MepResult> {
  const db = createDatabaseClient();
  if (!db) {
    return { points: [], error: "missing_credentials" };
  }

  const { data, error } = await db
    .from(MEP_SERIES_RELATION)
    .select("datetime, venta, compra")
    .gte("datetime", MEP_SERIES_FROM)
    .lt("datetime", MEP_SERIES_UNTIL)
    .order("datetime", { ascending: true })
    .limit(MEP_SERIES_LIMIT);

  if (error) {
    return { points: [], error: toMepErrorCode(error.message) };
  }

  return {
    points: (data ?? []).map((row) => coerceMepRow(row as Record<string, unknown>)),
  };
}
