"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  NAV_SECTION_IDS,
  resolveActiveSection,
  sectionIdFromHash,
  type SectionAnchor,
} from "@/lib/active-section";
import { copy, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PROBE_SLACK_PX = 16;

function measureAnchors(): SectionAnchor[] {
  return NAV_SECTION_IDS.flatMap((id) => {
    const el = document.getElementById(id);
    if (!el) return [];
    return [{ id, top: el.getBoundingClientRect().top + window.scrollY }];
  });
}

export function SiteNav({ locale }: { locale: Locale }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const locked = useRef(false);
  const lockTarget = useRef<string | null>(null);
  const unlockTimer = useRef<number>(0);
  const t = copy(locale);
  const labels = {
    sql: t.nav.sql,
    apis: t.nav.apis,
    tech: t.nav.tech,
    "procesos-1": t.nav.processes,
    contact: t.nav.contact,
  };
  const links = NAV_SECTION_IDS.map((id) => ({
    id,
    href: `#${id}`,
    label: labels[id],
  }));

  const syncFromScroll = useCallback(() => {
    setScrolled(window.scrollY > 12);
    const offset = (headerRef.current?.offsetHeight ?? 0) + PROBE_SLACK_PX;
    const resolved = resolveActiveSection(measureAnchors(), {
      scrollY: window.scrollY,
      offset,
      height: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
    });
    if (locked.current && resolved !== lockTarget.current) return;
    locked.current = false;
    setActiveId(resolved);
  }, []);

  useEffect(() => {
    function applyHash(hash: string) {
      const id = sectionIdFromHash(hash);
      locked.current = true;
      lockTarget.current = id;
      setActiveId(id);
    }

    const onHashChange = () => applyHash(window.location.hash);
    const onScrollEnd = () => {
      locked.current = false;
      syncFromScroll();
    };

    const frame = window.requestAnimationFrame(() => {
      if (window.location.hash) applyHash(window.location.hash);
      syncFromScroll();
    });

    window.addEventListener("scroll", syncFromScroll, { passive: true });
    window.addEventListener("resize", syncFromScroll);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("scrollend", onScrollEnd);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", syncFromScroll);
      window.removeEventListener("resize", syncFromScroll);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("scrollend", onScrollEnd);
      window.clearTimeout(unlockTimer.current);
    };
  }, [syncFromScroll]);

  function lockSection(id: string | null) {
    locked.current = true;
    lockTarget.current = id;
    setActiveId(id);
    window.clearTimeout(unlockTimer.current);
    unlockTimer.current = window.setTimeout(() => {
      locked.current = false;
      syncFromScroll();
    }, 1000);
  }

  return (
    <header
      ref={headerRef}
      className={cn(
        "site-nav fixed top-0 right-0 left-0 z-50 h-[var(--navbar-h)] border-b transition-colors",
        scrolled
          ? "border-border bg-background/95 backdrop-blur-md"
          : "border-transparent bg-background/80 backdrop-blur-sm",
      )}
    >
      <div className="page-gutter mx-auto flex h-full max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-1 lg:flex-nowrap lg:gap-3">
        <a
          href="#home"
          className="font-heading order-1 min-w-0 truncate text-base font-bold tracking-tight"
          onClick={() => lockSection(null)}
        >
          <span className="md:hidden">CSA Challenge</span>
          <span className="hidden md:inline">CSA Challenge - Facundo Krens</span>
        </a>
        <div className="order-2 flex shrink-0 items-center gap-1 lg:order-3">
          <LanguageSwitcher locale={locale} label={t.nav.language} />
        </div>
        <nav className="order-3 flex w-full flex-wrap items-center gap-0.5 lg:order-2 lg:w-auto lg:flex-1 lg:justify-end lg:gap-1">
          {links.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? "location" : undefined}
                onClick={() => lockSection(link.id)}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:px-3 sm:text-sm",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
