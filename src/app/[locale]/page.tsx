"use client";

import { useRoleContext } from "@/app/shared/hooks/useRoleContext";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import { Loader, Box, Button, BodyShort, Heading, Tag } from "@navikt/ds-react";
import { ErrorMessage } from "@/app/components/ErrorMessage";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AppRole } from "@/app/shared/contexts/RoleContext";
import styles from "./page.module.css";

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

  const subtitleVariant: Record<AppRole, "alt1" | "info" | "warning" | "success"> = {
    DEVELOPER: "alt1",
    TEAM_MEMBER: "info",
    LEADER: "warning",
    TEAM_LEADER: "success",
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={styles.roleCard}
      style={selected ? {
        borderColor: "var(--ax-border-accent)",
        boxShadow: "0 0 0 1px var(--ax-border-accent)",
      } : undefined}
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
    </button>
  );
}

export default function Home() {
  const { data: vulnData, error } = useVulnerabilitiesContext();
  const {
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
  const searchParams = useSearchParams();

  const buildRedirectUrl = useCallback(
    (role: string): string => {
      const base = redirectPath(locale, role);
      const query = searchParams.toString();
      return query ? `${base}?${query}` : base;
    },
    [locale, searchParams]
  );

  const [pendingRole, setPendingRole] = useState<AppRole | null>(null);

  // If a role is already cached, skip welcome and redirect immediately
  useEffect(() => {
    if (!isInitialized || isRoleLoading) return;
    if (!vulnData && !error) return;

    if (hasSelectedRole) {
      router.replace(buildRedirectUrl(effectiveRole || "TEAM_MEMBER"));
    }
  }, [isInitialized, isRoleLoading, vulnData, error, hasSelectedRole, effectiveRole, buildRedirectUrl, router]);

  function handleConfirm() {
    if (!pendingRole) return;
    setSelectedRole(pendingRole);
    router.replace(buildRedirectUrl(pendingRole));
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
