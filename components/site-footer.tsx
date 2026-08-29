import { copy, type Locale } from "@/lib/i18n";

const sources = [
  {
    href: "https://www.db-fiddle.com/f/ftyc8MFKVfYEFL6RRt7Vxx/0",
    label: "sql" as const,
  },
  {
    href: "https://petstore.swagger.io/#/",
    label: "swagger" as const,
  },
  {
    href: "https://www.ambito.com/contenidos/dolar-mep-historico.html",
    label: "ambito" as const,
  },
  {
    href: "https://modeler.camunda.io/share/f5a40189-dff6-4be2-9484-e9062d504b87",
    label: "camunda" as const,
  },
  {
    href: "https://www.complif.com",
    label: "site" as const,
  },
];

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = copy(locale);

  return (
    <footer className="site-footer relative z-10 shrink-0 border-t border-border bg-background pt-10 sm:pt-12">
      <div className="page-gutter mx-auto flex max-w-6xl flex-col gap-4 text-sm text-muted-foreground">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Facundo Krens
            </p>
            <nav aria-label={t.footer.sources} className="flex flex-wrap gap-x-5 gap-y-2">
              {sources.map((source) => (
                <a
                  key={source.href}
                  className="print-cite underline underline-offset-4 hover:text-foreground"
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.footer[source.label]}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <a
              href="https://www.complif.com"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 py-1 opacity-90 transition-opacity hover:opacity-100 print:hidden"
            >
              <img
                src="/complif-logo.svg"
                alt={t.footer.site}
                width={128}
                height={35}
                className="h-7 w-auto sm:h-8"
              />
            </a>
            <p>{t.footer.tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
