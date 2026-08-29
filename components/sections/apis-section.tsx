import { ApiFlow } from "@/components/api-flow";
import { PromptCard } from "@/components/prompt-card";
import { ReasonSlot } from "@/components/reason-slot";
import { Section, Stagger, StaggerItem } from "@/components/section";
import { SourceLink } from "@/components/source-link";
import { isFilled } from "@/lib/copy-slots";
import { copy, type Locale } from "@/lib/i18n";
import { buyBuhoFlow, renameMonoFlow } from "@/lib/petstore-flows";

const SWAGGER_HREF = "https://petstore.swagger.io/#/";

export function ApisSection({ locale }: { locale: Locale }) {
  const t = copy(locale);
  const [buyItem, renameItem, complifItem] = t.apis.items;
  const flows = [
    { item: buyItem, flow: buyBuhoFlow, labels: t.apis.buy },
    { item: renameItem, flow: renameMonoFlow, labels: t.apis.rename },
  ];

  return (
    <Section id="apis" kicker={t.apis.kicker} title={t.apis.title} intro={t.apis.intro}>
      <div className="mb-6">
        <SourceLink href={SWAGGER_HREF}>{t.apis.source}</SourceLink>
      </div>

      <Stagger className="flex flex-col gap-4">
        {flows.map(({ item, flow, labels }) => (
          <StaggerItem key={item.k} className="min-w-0 max-w-full">
            <article className="min-w-0 max-w-full overflow-x-hidden rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
              <p className="font-mono text-xs text-primary">{item.k}</p>
              <h3 className="mt-1 text-sm font-semibold sm:text-base">
                {item.t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.q}
              </p>
              <div className="mt-5 min-w-0 max-w-full overflow-x-hidden">
                <ApiFlow
                  flow={flow}
                  copy={labels}
                  legendOk={t.apis.legendOk}
                  legendError={t.apis.legendError}
                />
              </div>
              {isFilled(item.a) ? (
                <ReasonSlot
                  label={t.pending.label}
                  body={item.a}
                  pendingLabel={t.pending.label}
                  pendingBody={t.pending.body}
                  className="mt-5"
                />
              ) : null}
            </article>
          </StaggerItem>
        ))}

        <StaggerItem className="min-w-0">
          <PromptCard
            item={complifItem}
            pendingLabel={t.pending.label}
            pendingFlowLabel={t.pending.flow}
            pendingBody={t.pending.body}
          />
        </StaggerItem>
      </Stagger>
    </Section>
  );
}
