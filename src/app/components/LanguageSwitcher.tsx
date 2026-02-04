"use client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
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
    
    if (newLocale === locale) return;
    
    startTransition(() => {
      // Set cookie to persist locale choice
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      
      // Remove current locale prefix and add new one
      const pathWithoutLocale = pathname.replace(/^\/(nb|en)/, '') || '/';
      const newPath = `/${newLocale}${pathWithoutLocale}`;
      
      router.push(newPath);
      router.refresh();
    });
  };

  return (
    <Select
      label={t("language")}
      value={locale}
      onChange={handleChange}
      size="small"
      disabled={isPending}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </Select>
  );
}
