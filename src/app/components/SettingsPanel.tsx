"use client";

import { Popover, Button, VStack, BodyShort, Select } from "@navikt/ds-react";
import { CogIcon } from "@navikt/aksel-icons";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useRoleContext } from "@/app/shared/hooks/useRoleContext";
import type { AppRole } from "@/app/shared/contexts/RoleContext";

function redirectPath(locale: string, role: string): string {
  return role === "DEVELOPER" ? `/${locale}/prioritization` : `/${locale}/compliance`;
}

function RoleSwitcher() {
  const { effectiveRole, actualRole, availableRoles, setSelectedRole } = useRoleContext();
  const t = useTranslations("roleContext");
  const locale = useLocale();
  const router = useRouter();

  const displayValue = (effectiveRole || actualRole || "") as AppRole | "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as AppRole;
    if (newRole === actualRole) {
      setSelectedRole(null);
    } else {
      setSelectedRole(newRole);
    }
    router.push(redirectPath(locale, newRole));
  };

  if (availableRoles.length === 0) return null;

  return (
    <Select
      label={t("changeRole")}
      size="small"
      value={displayValue}
      onChange={handleChange}
    >
      {availableRoles.map((role) => (
        <option key={role} value={role}>
          {t(role)}
        </option>
      ))}
    </Select>
  );
}

export function SettingsPanel() {
  const t = useTranslations("settings");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const handleButtonClick = () => {
    setOpen(!open);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Button
        ref={setAnchorEl}
        onClick={handleButtonClick}
        icon={<CogIcon aria-hidden />}
        variant="tertiary"
        size="small"
        aria-label={t("title")}
      >
        <BodyShort size="small">{t("title")}</BodyShort>
      </Button>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={anchorEl}
        placement="bottom-end"
      >
        <Popover.Content>
          <VStack gap="space-4">
            <RoleSwitcher />
            <ThemeToggle />
            <LanguageSwitcher />
          </VStack>
        </Popover.Content>
      </Popover>
    </div>
  );
}
