import { PromptCard } from "@/components/prompt-card";
import { Section, Stagger, StaggerItem } from "@/components/section";
import { SourceLink } from "@/components/source-link";
import { copy, type Locale } from "@/lib/i18n";

const CAMUNDA_HREF =
  "https://modeler.camunda.io/share/f5a40189-dff6-4be2-9484-e9062d504b87";

export function ProcessesISection({ locale }: { locale: Locale }) {
  const t = copy(locale);

  return (
    <Section
      id="procesos-1"
      kicker={t.processesI.kicker}
      title={t.processesI.title}
      intro={t.processesI.intro}
    >
      <div className="mb-6">
        <SourceLink href={CAMUNDA_HREF}>{t.processesI.source}</SourceLink>
      </div>
      <Stagger className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.processesI.glossary.map((item) => (
          <StaggerItem key={item.k}>
            <article className="h-full min-w-0 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <p className="text-sm font-semibold">{item.k}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.d}
              </p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
      <div className="grid grid-cols-1 gap-4">
        {t.processesI.items.map((item) => (
          <PromptCard
            key={item.k}
            item={item}
            pendingLabel={t.pending.label}
            pendingFlowLabel={t.pending.flow}
            pendingBody={t.pending.body}
          />
        ))}
      </div>
    </Section>
  );
}
