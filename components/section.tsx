import { cn } from "@/lib/utils";

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("reveal", className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("reveal-stagger", className)}>{children}</div>;
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("reveal", className)}>{children}</div>;
}

export function Section({
  id,
  kicker,
  title,
  intro,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="section-anchor border-t border-border/70 py-14 sm:py-20 md:py-28"
    >
      <div className="page-gutter mx-auto max-w-6xl">
        <FadeIn>
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            {kicker}
          </p>
          <h2 className="font-heading mt-3 max-w-3xl text-2xl leading-tight font-bold text-balance sm:text-3xl md:text-4xl">
            {title}
          </h2>
          {intro ? (
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
              {intro}
            </p>
          ) : null}
        </FadeIn>
        <div className="mt-8 md:mt-10">{children}</div>
      </div>
    </section>
  );
}
