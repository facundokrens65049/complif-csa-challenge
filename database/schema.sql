-- Tick-by-tick bid/ask for the same instrument in ARS and USD, plus the
-- implied MEP series. Seed: challenge db-fiddle.
-- https://www.db-fiddle.com/f/ftyc8MFKVfYEFL6RRt7Vxx/0

DROP MATERIALIZED VIEW IF EXISTS public.mep_implicito_mv;
DROP VIEW IF EXISTS public.mep_implicito;
DROP TABLE IF EXISTS public.precios;

CREATE TABLE public.precios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  datetime TIMESTAMPTZ NOT NULL,
  moneda VARCHAR(3) NOT NULL CHECK (moneda IN ('ARS', 'USD')),
  bid NUMERIC NOT NULL,
  ask NUMERIC NOT NULL
);


CREATE INDEX precios_datetime_moneda_id_idx
  ON public.precios (datetime, moneda, id);

CREATE OR REPLACE VIEW public.mep_implicito
WITH (security_invoker = true) AS
WITH base AS (
  SELECT
    id,
    datetime,
    moneda,
    CASE WHEN moneda = 'ARS' THEN bid END AS ars_bid,
    CASE WHEN moneda = 'ARS' THEN ask END AS ars_ask,
    CASE WHEN moneda = 'USD' THEN bid END AS usd_bid,
    CASE WHEN moneda = 'USD' THEN ask END AS usd_ask,
    COUNT(CASE WHEN moneda = 'ARS' THEN 1 END)
      OVER (ORDER BY datetime, moneda, id) AS ars_grp,
    COUNT(CASE WHEN moneda = 'USD' THEN 1 END)
      OVER (ORDER BY datetime, moneda, id) AS usd_grp
  FROM public.precios
),
filled AS (
  SELECT
    id,
    datetime,
    moneda,
    MAX(ars_bid) OVER (PARTITION BY ars_grp) AS ars_bid,
    MAX(ars_ask) OVER (PARTITION BY ars_grp) AS ars_ask,
    MAX(usd_bid) OVER (PARTITION BY usd_grp) AS usd_bid,
    MAX(usd_ask) OVER (PARTITION BY usd_grp) AS usd_ask
  FROM base
  WHERE ars_grp > 0
    AND usd_grp > 0
),
mep AS (
  SELECT
    id,
    datetime,
    ROUND(ars_bid / NULLIF(usd_ask, 0), 6) AS venta,
    ROUND(ars_ask / NULLIF(usd_bid, 0), 6) AS compra,
    ars_bid,
    ars_ask,
    usd_bid,
    usd_ask,
    LAG(ars_bid) OVER (ORDER BY datetime, moneda, id) AS prev_ars_bid,
    LAG(ars_ask) OVER (ORDER BY datetime, moneda, id) AS prev_ars_ask,
    LAG(usd_bid) OVER (ORDER BY datetime, moneda, id) AS prev_usd_bid,
    LAG(usd_ask) OVER (ORDER BY datetime, moneda, id) AS prev_usd_ask
  FROM filled
)
SELECT datetime, venta, compra, id
FROM mep
WHERE prev_ars_bid IS NULL
   OR ars_bid IS DISTINCT FROM prev_ars_bid
   OR ars_ask IS DISTINCT FROM prev_ars_ask
   OR usd_bid IS DISTINCT FROM prev_usd_bid
   OR usd_ask IS DISTINCT FROM prev_usd_ask;

COMMENT ON VIEW public.mep_implicito IS
  'Live implied MEP series. Identity of each change is precios.id; (datetime, moneda) is not unique. Not materialized: ticks arrive continuously, so a cache would need a REFRESH on every load.';

COMMENT ON INDEX public.precios_datetime_moneda_id_idx IS
  'Access path for everyday queries: range by instant, then moneda; id breaks ties at the same millisecond.';

ALTER TABLE public.precios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read precios" ON public.precios;
CREATE POLICY "anon read precios"
  ON public.precios
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON public.precios TO anon, authenticated;
GRANT SELECT ON public.mep_implicito TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
