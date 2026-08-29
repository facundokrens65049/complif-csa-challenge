"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const router = useRouter();

  function select(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    document.documentElement.lang = next;
    router.refresh();
  }

  return (
    <div
      className="flex shrink-0 items-center rounded-full bg-muted p-0.5"
      role="group"
      aria-label={label}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={locale === code}
          onClick={() => select(code)}
          className={cn(
            "min-h-8 min-w-8 appearance-none rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase transition-colors",
            locale === code
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
