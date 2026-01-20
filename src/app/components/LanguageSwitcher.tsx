"use client";
import { useRouter, usePathname } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { Select } from "@navikt/ds-react";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const t = useTranslations("header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const languages = [
    { code: "nb", flag: "🇳🇴", name: "Norsk" },
    { code: "en", flag: "🇬🇧", name: "English" },
  ];

  const toLocalePath = (path: string, targetLocale: "nb" | "en") => {
    const defaultLocale = routing.defaultLocale as "nb" | "en";

    // Normalize path (ensure leading slash)
    let normalized = path.startsWith("/") ? path : `/${path}`;

    // Strip any existing locale prefix
    for (const loc of routing.locales) {
      const prefix = `/${loc}`;
      if (normalized === prefix) {
        normalized = "/";
        break;
      }
      if (normalized.startsWith(`${prefix}/`)) {
        normalized = normalized.slice(prefix.length);
        break;
      }
    }

    // Add new prefix unless default locale with "as-needed"
    if (targetLocale === defaultLocale) {
      return normalized;
    }
    return normalized === "/" ? `/${targetLocale}` : `/${targetLocale}${normalized}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as "nb" | "en";
    const currentPath = typeof window !== "undefined" ? window.location.pathname : pathname;
    const target = toLocalePath(currentPath, newLocale);

    startTransition(() => {
      router.replace(target);
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Select
        label={t("language")}
        value={locale}
        onChange={handleChange}
        size="small"
        hideLabel
        disabled={isPending}
        style={{ minWidth: "150px" }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
