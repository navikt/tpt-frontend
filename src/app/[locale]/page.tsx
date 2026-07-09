"use client";

import { useRoleContext } from "@/app/shared/hooks/useRoleContext";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import { Loader, Box, Button, BodyShort, Heading, Tag, List } from "@navikt/ds-react";
import { ErrorMessage } from "@/app/components/ErrorMessage";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AppRole } from "@/app/shared/contexts/RoleContext";

function redirectPath(locale: string, role: string): string {
  return role === "DEVELOPER" ? `/${locale}/prioritization` : `/${locale}/compliance`;
}

function RoleCard({
  role,
  selected,
  onSelect,
}: {
  role: AppRole;
  selected: boolean;
  onSelect: (role: AppRole) => void;
}) {
  const t = useTranslations("welcome.roles");
  const tWelcomeCard = useTranslations("welcome");

  const subtitleVariant: Record<AppRole, "alt1" | "info" | "warning" | "success"> = {
    DEVELOPER: "alt1",
    TEAM_MEMBER: "info",
    PRODUCT_LEADER: "warning",
    TECH_LEADER: "success",
  };

  const bullets = [
    t(`${role}.bullets.0`),
    t(`${role}.bullets.1`),
    t(`${role}.bullets.2`),
  ];

  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        borderRadius: "var(--a-border-radius-large)",
        border: selected
          ? "2px solid var(--a-blue-500)"
          : "2px solid var(--a-border-default)",
        background: selected
          ? "var(--a-surface-selected)"
          : "var(--a-surface-default)",
        padding: "1.5rem",
        gap: "0.75rem",
        transition: "border-color 120ms, background 120ms",
        boxShadow: selected ? "0 0 0 3px var(--a-blue-200)" : undefined,
        minWidth: 0,
      }}
      aria-pressed={selected}
    >
      <Box style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <Heading size="small" level="3">
          {t(`${role}.title`)}
        </Heading>
        <Tag variant={subtitleVariant[role]} size="small" style={{ alignSelf: "flex-start" }}>
          {t(`${role}.subtitle`)}
        </Tag>
      </Box>

      <BodyShort size="small" style={{ color: "var(--a-text-subtle)" }}>
        {t(`${role}.description`)}
      </BodyShort>

      <Box
        style={{
          borderTop: "1px solid var(--a-border-subtle)",
          paddingTop: "0.75rem",
        }}
      >
        <BodyShort
          size="small"
          weight="semibold"
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--a-text-subtle)",
            marginBottom: "0.5rem",
          }}
        >
          {tWelcomeCard("youWillSee")}
        </BodyShort>
        <List as="ul" size="small" style={{ margin: 0, paddingLeft: "1.25rem" }}>
          {bullets.map((bullet) => (
            <List.Item key={bullet}>{bullet}</List.Item>
          ))}
        </List>
      </Box>
    </button>
  );
}

export default function Home() {
  const { data: vulnData, error } = useVulnerabilitiesContext();
  const {
    actualRole,
    effectiveRole,
    isInitialized,
    isLoading: isRoleLoading,
    hasSelectedRole,
    availableRoles,
    setSelectedRole,
  } = useRoleContext();

  const t = useTranslations("errors");
  const tWelcome = useTranslations("welcome");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [pendingRole, setPendingRole] = useState<AppRole | null>(null);

  // If a role is already cached, skip welcome and redirect immediately
  useEffect(() => {
    if (!isInitialized || isRoleLoading) return;
    if (!vulnData && !error) return;

    if (hasSelectedRole) {
      router.replace(redirectPath(locale, effectiveRole || "TEAM_MEMBER"));
    }
  }, [isInitialized, isRoleLoading, vulnData, error, hasSelectedRole, effectiveRole, locale, router]);

  function handleConfirm() {
    if (!pendingRole) return;
    setSelectedRole(pendingRole);
    router.replace(redirectPath(locale, pendingRole));
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        title={t("fetchVulnerabilitiesError")}
      />
    );
  }

  // Show loader while API is in flight or while redirecting (role already set)
  if (!isInitialized || isRoleLoading || hasSelectedRole) {
    return (
      <Box
        paddingBlock="space-24"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Loader size="large" title={tCommon("loading")} />
      </Box>
    );
  }

  // Welcome / role selection screen
  return (
    <Box
      paddingBlock="space-24"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "3rem 1.5rem",
      }}
    >
      {/* Header */}
      <Box style={{ textAlign: "center", maxWidth: "640px" }}>
        <BodyShort
          size="small"
          weight="semibold"
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--a-text-subtle)",
            marginBottom: "0.75rem",
          }}
        >
          {tWelcome("eyebrow")}
        </BodyShort>
        <Heading size="xlarge" level="1" style={{ marginBottom: "1rem" }}>
          {tWelcome("heading")}
        </Heading>
        <BodyShort style={{ color: "var(--a-text-subtle)" }}>
          {tWelcome("subheading")}
        </BodyShort>
      </Box>

      {/* Role cards grid */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${availableRoles.length}, minmax(220px, 1fr))`,
          gap: "1.25rem",
          width: "100%",
        }}
      >
        {availableRoles.map((role) => (
          <RoleCard
            key={role}
            role={role}
            selected={pendingRole === role}
            onSelect={setPendingRole}
          />
        ))}
      </Box>

      {/* CTA */}
      <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
        <Button
          variant="primary"
          size="medium"
          disabled={!pendingRole}
          onClick={handleConfirm}
        >
          {pendingRole ? tWelcome("selectButton") : tWelcome("selectPrompt")}
        </Button>
        <BodyShort size="small" style={{ color: "var(--a-text-subtle)" }}>
          {tWelcome("changeAnytime")}
        </BodyShort>
      </Box>
    </Box>
  );
}
