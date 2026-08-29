export type MepPoint = {
  datetime: string;
  venta: number;
  compra: number;
};

export type MepErrorCode = "missing_credentials" | "unavailable";

export type MepResult = {
  points: MepPoint[];
  error?: MepErrorCode;
};

export type MepStats = {
  lastVenta: number;
  lastCompra: number;
  spread: number;
  minVenta: number;
  maxVenta: number;
  minCompra: number;
  maxCompra: number;
  count: number;
  from: string;
  to: string;
};
