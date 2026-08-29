import { BpmnViewer } from "@/components/bpmn-viewer";
import { Section, Stagger, StaggerItem } from "@/components/section";
import { copy, type Locale } from "@/lib/i18n";

export function ProcessesIISection({ locale }: { locale: Locale }) {
  const t = copy(locale);

  return (
    <Section
      id="procesos-2"
      kicker={t.processesII.kicker}
      title={t.processesII.title}
      intro={t.processesII.intro}
    >
      <Stagger className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.processesII.glossary.map((item) => (
          <StaggerItem key={item.k} className="min-w-0 max-w-full">
            <article className="h-full min-w-0 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <p className="text-sm font-semibold">{item.k}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.d}
              </p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
      <div className="min-w-0 max-w-full overflow-hidden">
        <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          {t.processesII.pool}
        </p>
        <BpmnViewer
          key={locale}
          hint={t.processesII.hint}
          zoomInLabel={t.processesII.zoomIn}
          zoomOutLabel={t.processesII.zoomOut}
          fitLabel={t.processesII.fit}
          errorLabel={t.processesII.loadError}
          legend={t.processesII.legend}
          diagramCopy={{
            pool: t.processesII.pool,
            yes: t.processesII.legend.yes,
            no: t.processesII.legend.no,
            lanes: t.processesII.lanes,
            nodes: t.processesII.nodes,
            notes: t.processesII.notes,
          }}
        />
      </div>
    </Section>
  );
}
