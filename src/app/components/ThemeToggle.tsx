"use client";

import { useTheme } from "next-themes";
import { Select } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("settings");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This runs only once on mount, after initial render
    // This is the recommended pattern for next-themes to avoid hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder to avoid hydration mismatch
    return (
      <Select
        label={t("theme")}
        size="small"
        value="system"
        onChange={() => {}}
        disabled
      >
        <option value="system">{t("themeSystem")}</option>
      </Select>
    );
  }

  const themes = [
    { value: "light", label: t("themeLys") },
    { value: "dark", label: t("themeMork") },
    { value: "system", label: t("themeSystem") },
  ];

  return (
    <Select
      label={t("theme")}
      size="small"
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
    >
      {themes.map((themeOption) => (
        <option key={themeOption.value} value={themeOption.value}>
          {themeOption.label}
        </option>
      ))}
    </Select>
  );
}
