"use client";

import { ActionMenu, InternalHeader, VStack } from "@navikt/ds-react";
import { CogIcon, ChevronDownIcon, PersonIcon } from "@navikt/aksel-icons";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useRoleContext } from "../shared/hooks/useRoleContext";
import { adminNavLink } from "../shared/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

interface AvatarMenuProps {
  email: string;
}

function getInitials(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(".");
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function AvatarMenu({ email }: AvatarMenuProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { actualRole } = useRoleContext();

  const isAdmin = actualRole === "ADMIN";
  const initials = getInitials(email);

  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <InternalHeader.Button>
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.1rem",
              height: "2.1rem",
              borderRadius: "50%",
              background: "var(--a-surface-neutral-moderate)",
              color: "var(--a-text-default)",
              fontSize: "0.85rem",
              fontWeight: 600,
              flexShrink: 0,
              gap: "0.2rem",
            }}
          >
            <PersonIcon aria-hidden fontSize="0.85rem" />
            {initials}
          </span>
          <CogIcon aria-hidden fontSize="1.25rem" />
          <ChevronDownIcon aria-hidden fontSize="1rem" />
          <span className="sr-only">{t("settings.title")}</span>
        </InternalHeader.Button>
      </ActionMenu.Trigger>
      <ActionMenu.Content>
        {isAdmin && (
          <ActionMenu.Item
            onSelect={() => router.push(`/${locale}${adminNavLink.path}`)}
          >
            {t(adminNavLink.labelKey)}
          </ActionMenu.Item>
        )}
        {isAdmin && <ActionMenu.Divider />}
        <div style={{ padding: "var(--a-spacing-3) var(--a-spacing-4)" }}>
          <VStack gap="space-4">
            <ThemeToggle />
            <LanguageSwitcher />
          </VStack>
        </div>
      </ActionMenu.Content>
    </ActionMenu>
  );
}
