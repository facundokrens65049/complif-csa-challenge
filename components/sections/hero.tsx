import { FadeIn } from "@/components/section";
import { copy, type Locale } from "@/lib/i18n";

export function HeroSection({ locale }: { locale: Locale }) {
  const t = copy(locale);

  return (
    <section
      id="home"
      className="hero-min-h relative flex items-center justify-center overflow-hidden py-16 sm:py-20 md:min-h-[580px] md:py-28 print:min-h-0 print:py-8"
    >
      <div className="hero-blobs pointer-events-none absolute inset-0 print:hidden" aria-hidden>
        <span className="hero-blob hero-blob-a" />
        <span className="hero-blob hero-blob-b" />
        <span className="hero-blob hero-blob-c" />
      </div>
      <div className="page-gutter relative mx-auto w-full max-w-6xl text-center">
        <FadeIn>
          <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-primary uppercase sm:text-xs sm:tracking-[0.2em]">
            {t.hero.kicker}
          </p>
          <h1 className="font-heading mx-auto mt-4 max-w-4xl text-[2rem] leading-[1.08] font-bold text-balance sm:mt-5 sm:text-5xl md:text-6xl">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-base md:text-lg">
            {t.hero.body}
            <br />
            {t.hero.closer}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
