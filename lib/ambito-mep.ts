export const AMBITO_MEP_CLOSE_ENDPOINT =
  "https://mercados.ambito.com/dolarrava/mep/historico-general";

export const AMBITO_MEP_CLOSE_EXAMPLE_FROM = "2026-07-01";
export const AMBITO_MEP_CLOSE_EXAMPLE_UNTIL = "2026-07-08";

export const AMBITO_MEP_CLOSE_SAMPLE: ReadonlyArray<readonly [string, string]> =
  [
    ["Fecha", "Referencia"],
    ["07/07/2026", "1529,19"],
    ["06/07/2026", "1525,47"],
    ["03/07/2026", "1524,53"],
    ["02/07/2026", "1529,77"],
    ["01/07/2026", "1521,03"],
  ];

export function ambitoMepCloseExampleUrl() {
  return `${AMBITO_MEP_CLOSE_ENDPOINT}/${AMBITO_MEP_CLOSE_EXAMPLE_FROM}/${AMBITO_MEP_CLOSE_EXAMPLE_UNTIL}`;
}

export function ambitoMepCloseSampleJson() {
  return JSON.stringify(AMBITO_MEP_CLOSE_SAMPLE, null, 4);
}
