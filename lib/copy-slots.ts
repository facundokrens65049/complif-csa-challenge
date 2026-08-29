export type CopyStep = {
  k: string;
  t: string;
  d: string;
};

export type CopyPrompt = {
  k: string;
  t?: string;
  q: string;
  a: string;
  steps?: CopyStep[];
};

export function isFilled(value: string | undefined): boolean {
  return Boolean(value?.trim());
}
