import { ApisSection } from "@/components/sections/apis-section";
import { ChallengeSection } from "@/components/sections/challenge";
import { ContactSection } from "@/components/sections/contact";
import { HeroSection } from "@/components/sections/hero";
import { ProcessesISection } from "@/components/sections/processes-i-section";
import { ProcessesIISection } from "@/components/sections/processes-ii-section";
import { SqlSection } from "@/components/sections/sql-section";
import { TechSection } from "@/components/sections/tech-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { loadContact } from "@/lib/contact";
import { getLocale } from "@/lib/locale";
import { getMepSeries } from "@/lib/mep";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getLocale();
  const contact = loadContact();
  const { points, error } = await getMepSeries();

  return (
    <>
      <SiteNav locale={locale} />
      <main className="app-shell flex-1">
        <HeroSection locale={locale} />
        <ChallengeSection locale={locale} />
        <div
          id="solution"
          className="section-anchor"
        >
          <SqlSection locale={locale} points={points} error={error} />
          <ApisSection locale={locale} />
          <TechSection locale={locale} />
          <ProcessesISection locale={locale} />
          <ProcessesIISection locale={locale} />
        </div>
        <ContactSection locale={locale} contact={contact} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
