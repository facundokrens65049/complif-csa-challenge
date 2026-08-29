"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { Mail, Phone } from "lucide-react";
import { copy, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const BACK_COUNT = 4;

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function isFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

const rowClass =
  "flex min-h-10 items-center gap-3 rounded-sm text-sm leading-tight text-foreground/85 transition-colors hover:text-primary sm:min-h-11 sm:text-base";

export function ContactDeck({
  locale,
  email,
  phone,
  linkedinUrl,
  emailHref,
  phoneHref,
}: {
  locale: Locale;
  email: string;
  phone: string;
  linkedinUrl: string;
  emailHref: string;
  phoneHref: string;
}) {
  const t = copy(locale);
  const [fanned, setFanned] = useState(false);

  const onMouseEnter = useCallback(() => {
    if (isFinePointer()) setFanned(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    if (isFinePointer()) setFanned(false);
  }, []);

  const onClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (isFinePointer()) return;
    if ((event.target as HTMLElement).closest("a")) return;
    setFanned((open) => !open);
  }, []);

  return (
    <div className="contact-deck-stage">
      <div
        className="contact-deck"
        data-fanned={fanned || undefined}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        role="group"
        aria-label={t.contact.deck}
      >
        {Array.from({ length: BACK_COUNT }, (_, index) => (
          <div key={index} className="biz-card" aria-hidden="true">
            <div className="biz-card-back">
              <div className="biz-card-back-frame" />
            </div>
          </div>
        ))}
        <div className="biz-card">
          <article className="biz-card-face">
            <span className="biz-card-stripe" aria-hidden />
            <div className="relative z-10 flex h-full min-h-0 flex-col">
              <p className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Facundo Krens
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
                {t.contact.city}
              </p>
              <div className="mt-4 mb-3 h-px w-12 bg-foreground/15" />
              <ul className="mt-auto space-y-0.5">
                {email ? (
                  <li>
                    <a
                      href={emailHref}
                      aria-label={t.contact.cta}
                      className={cn(rowClass, "min-w-0")}
                    >
                      <Mail className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0 truncate">{email}</span>
                    </a>
                  </li>
                ) : null}
                {phone ? (
                  <li>
                    <a
                      href={phoneHref}
                      aria-label={t.contact.phone}
                      className={rowClass}
                    >
                      <Phone className="size-4 shrink-0 text-primary" />
                      <span>{phone}</span>
                    </a>
                  </li>
                ) : null}
                {linkedinUrl ? (
                  <li>
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t.contact.linkedin}
                      className={rowClass}
                    >
                      <LinkedinIcon className="size-4 shrink-0 text-primary" />
                      <span>{t.contact.linkedin}</span>
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
