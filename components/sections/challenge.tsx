import { Database, GitBranch, Ticket, Webhook, Workflow } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/section";
import { copy, type Locale } from "@/lib/i18n";

const icons = [Database, Webhook, Ticket, GitBranch, Workflow];

export function ChallengeSection({ locale }: { locale: Locale }) {
  const t = copy(locale);

  return (
    <section
      id="challenge"
      className="section-anchor border-t border-border/70 py-14 sm:py-16 md:py-24"
    >
      <div className="page-gutter mx-auto max-w-6xl">
        <FadeIn>
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            {t.challenge.kicker}
          </p>
          <h2 className="font-heading mt-3 max-w-3xl text-2xl leading-tight font-bold text-balance sm:text-3xl md:text-4xl">
            {t.challenge.title}
          </h2>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
            {t.challenge.body}
          </p>
        </FadeIn>
        <Stagger className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {t.challenge.items.map((item, index) => {
            const Icon = icons[index] ?? Database;
            return (
              <StaggerItem key={item.k}>
                <a href={item.href} className="block h-full min-w-0">
                  <div className="lift-card h-full rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
                    <div className="flex size-12 items-center justify-center rounded-full bg-accent text-primary print:hidden">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </div>
                    <p className="mt-4 font-mono text-xs text-primary print:mt-0">{item.k}</p>
                    <p className="mt-1 text-sm font-semibold">{item.t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.d}
                    </p>
                  </div>
                </a>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
