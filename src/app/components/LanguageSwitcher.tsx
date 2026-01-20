"use client";
import { useRouter, usePathname } from "@/i18n/routing";
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as "nb" | "en";
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
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
