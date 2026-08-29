import { ContactDeck } from "@/components/sections/contact-deck";
import { FadeIn } from "@/components/section";
import { mailtoHref, telHref, type ContactInfo } from "@/lib/contact";
import { copy, type Locale } from "@/lib/i18n";

export function ContactSection({
  locale,
  contact,
}: {
  locale: Locale;
  contact: ContactInfo;
}) {
  const t = copy(locale);

  return (
    <section
      id="contact"
      className="section-anchor border-t border-border/70 pt-14 pb-20 sm:pt-20 sm:pb-28 md:pt-28 md:pb-36"
    >
      <div className="page-gutter mx-auto max-w-6xl">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-base font-semibold tracking-[0.16em] text-primary uppercase sm:text-lg sm:tracking-[0.18em]">
              {t.contact.kicker}
            </p>
            <h2 className="font-heading mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
              {t.contact.body}
            </h2>
          </div>
          <ContactDeck
            locale={locale}
            email={contact.email}
            phone={contact.phone}
            linkedinUrl={contact.linkedinUrl}
            emailHref={contact.email ? mailtoHref(contact.email) : ""}
            phoneHref={contact.phone ? telHref(contact.phone) : ""}
          />
        </FadeIn>
      </div>
    </section>
  );
}
