"use client";

import { Popover, Button, VStack, BodyShort } from "@navikt/ds-react";
import { CogIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { RoleContextSwitcher } from "./RoleContextSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function SettingsPanel() {
  const t = useTranslations("settings");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  const handleButtonClick = () => {
    setOpen(!open);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={anchorEl}
        placement="bottom-end"
      >
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
        <Popover.Content>
          <VStack gap="space-4">
            <ThemeToggle />
            <RoleContextSwitcher />
            <LanguageSwitcher />
          </VStack>
        </Popover.Content>
      </Popover>
    </div>
  );
}
