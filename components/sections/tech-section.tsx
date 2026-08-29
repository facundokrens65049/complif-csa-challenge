import { Section, Stagger, StaggerItem } from "@/components/section";
import { SourceLink } from "@/components/source-link";
import { TechTicket } from "@/components/tech-ticket";
import {
  AMBITO_MEP_CLOSE_ENDPOINT,
  ambitoMepCloseExampleUrl,
  ambitoMepCloseSampleJson,
} from "@/lib/ambito-mep";
import { copy, type Locale } from "@/lib/i18n";

const AMBITO_HREF =
  "https://www.ambito.com/contenidos/dolar-mep-historico.html";

export function TechSection({ locale }: { locale: Locale }) {
  const t = copy(locale);

  return (
    <Section id="tech" kicker={t.tech.kicker} title={t.tech.title} intro={t.tech.intro}>
      <div className="mb-6">
        <SourceLink href={AMBITO_HREF}>{t.tech.source}</SourceLink>
      </div>
      <Stagger className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {t.tech.brief.map((block) => (
          <StaggerItem key={block.k}>
            <article className="h-full min-w-0 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
              <p className="text-[11px] tracking-wider text-primary uppercase">
                {block.k}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {block.body}
              </p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          {t.tech.ticketLabel}
        </p>
        <TechTicket
          ticket={t.tech.ticket}
          endpoint={AMBITO_MEP_CLOSE_ENDPOINT}
          exampleUrl={ambitoMepCloseExampleUrl()}
          sampleJson={ambitoMepCloseSampleJson()}
        />
      </div>
    </Section>
  );
}
