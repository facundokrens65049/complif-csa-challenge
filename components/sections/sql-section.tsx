import { EmptyState } from "@/components/empty-state";
import { MepChart } from "@/components/mep-chart";
import { Section, Stagger, StaggerItem } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { formatMepAmount, formatMepRange, formatRange, getMepStats } from "@/lib/format";
import { copy, numberLocale, type Locale } from "@/lib/i18n";
import { mepSeriesSelectSql } from "@/lib/mep";
import type { MepErrorCode, MepPoint } from "@/lib/types";


export function SqlSection({
  locale,
  points,
  error,
}: {
  locale: Locale;
  points: MepPoint[];
  error?: MepErrorCode;
}) {
  const t = copy(locale);
  const stats = getMepStats(points);

  return (
    <Section
      id="sql"
      kicker={t.sql.kicker}
      title={t.sql.title}
      intro={t.sql.intro}
    >
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {t.sql.blocks.map((block) => (
          <article
            key={block.k}
            className="min-w-0 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
          >
            <p className="text-[11px] tracking-wider text-primary uppercase">
              {block.k}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {block.body}
            </p>
          </article>
        ))}
      </div>

      <div className="mb-6 min-w-0 overflow-x-auto rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
        <p className="mb-3 text-[11px] tracking-wider text-primary uppercase">
          {t.sql.queryLabel}
        </p>
        <pre className="font-mono text-xs leading-relaxed whitespace-pre text-muted-foreground">
          {mepSeriesSelectSql()}
        </pre>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge variant={error ? "outline" : "default"}>Postgres</Badge>
        <Badge variant="outline">{t.sql.index}</Badge>
        {stats ? (
          <span className="text-xs text-muted-foreground">
            {formatRange(stats.from, stats.to)} ·{" "}
            {stats.count.toLocaleString(numberLocale(locale))} {t.sql.changes}
          </span>
        ) : null}
      </div>

      {error ? (
        <EmptyState
          className="mb-6 rounded-xl bg-card ring-1 ring-foreground/10"
          title={t.sql.errorTitle}
          description={
            error === "missing_credentials"
              ? t.sql.errorMissingCredentials
              : t.sql.errorUnavailable
          }
        />
      ) : null}

      {stats ? (
        <Stagger className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: t.sql.lastSell, value: formatMepAmount(stats.lastVenta) },
            { label: t.sql.lastBuy, value: formatMepAmount(stats.lastCompra) },
            { label: t.sql.spread, value: formatMepAmount(stats.spread, 3) },
            {
              label: t.sql.sellRange,
              value: formatMepRange(stats.minVenta, stats.maxVenta),
            },
          ].map((kpi) => (
            <StaggerItem key={kpi.label} className="min-w-0">
              <div className="lift-card h-full rounded-xl bg-card px-3 py-3 ring-1 ring-foreground/10 sm:px-4">
                <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                <p className="mt-1 font-mono text-sm leading-snug break-words tabular-nums sm:text-lg">
                  {kpi.value}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      ) : !error ? (
        <EmptyState
          className="mb-6 rounded-xl bg-card ring-1 ring-foreground/10"
          title={t.sql.emptyTitle}
          description={t.sql.emptyDescription}
        />
      ) : null}

      {points.length > 0 ? (
        <MepChart
          points={points}
          labels={{
            title: t.chart.title,
            sell: t.chart.sell,
            buy: t.chart.buy,
          }}
        />
      ) : null}
    </Section>
  );
}
