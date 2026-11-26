"use client";

import { useRoleContext } from "@/app/shared/hooks/useRoleContext";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import { Loader, Button, BodyShort, Box, Detail, Fieldset, Heading, HStack, Label, List, Tag, VStack, HGrid } from "@navikt/ds-react";
import { ErrorMessage } from "@/app/components/ErrorMessage";
import { LandingExplanation } from "@/app/components/LandingExplanation";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AppRole } from "@/app/shared/contexts/RoleContext";

function redirectPath(locale: string, role: string): string {
  return role === "DEVELOPER" ? `/${locale}/prioritization` : `/${locale}/compliance`;
}

function RoleCard({
  role,
  selected,
  suggested,
  onSelect,
  onContinue,
}: {
  role: AppRole;
  selected: boolean;
  suggested: boolean;
  onSelect: (role: AppRole) => void;
  onContinue: (role: AppRole) => void;
}) {
  const t = useTranslations("welcome");

  return (
    <Box
      as="button"
      type="button"
      onClick={() => onSelect(role)}
      onDoubleClick={() => onContinue(role)}
      aria-pressed={selected}
      background={selected ? "accent-soft" : "default"}
      borderColor={selected ? "accent" : "neutral-subtle"}
      borderWidth="2"
      borderRadius="8"
      padding="space-12"
      minWidth="0"
      style={{ cursor: "pointer", textAlign: "left", font: "inherit", color: "var(--ax-text-neutral)" }}
    >
      <VStack gap="space-8" align="start">
        <HStack gap="space-4" align="center" wrap>
          <BodyShort as="span" size="small" weight="semibold">
            {t(`roles.${role}.title`)}
          </BodyShort>
          {suggested && (
            <Tag variant="strong" data-color="info" size="xsmall">
              {t("suggested")}
            </Tag>
          )}
        </HStack>
        <Detail as="span" textColor="subtle">
          {t(`roles.${role}.description`)}
        </Detail>
      </VStack>
    </Box>
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
    selectedRole,
  } = useRoleContext();

  const t = useTranslations("errors");
  const tWelcome = useTranslations("welcome");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "true";

  const buildRedirectUrl = useCallback(
    (role: string): string => {
      const base = redirectPath(locale, role);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("welcome");
      const query = params.toString();
      return query ? `${base}?${query}` : base;
    },
    [locale, searchParams]
  );

  const [pendingRole, setPendingRole] = useState<AppRole | null>(null);
  const chosenRole = pendingRole ?? availableRoles.find((role) => role === selectedRole) ?? null;

  useEffect(() => {
    if (!isInitialized || isRoleLoading) return;
    if (!vulnData && !error) return;

    if (hasSelectedRole && !showWelcome) {
      router.replace(buildRedirectUrl(effectiveRole || "TEAM_MEMBER"));
    }
  }, [isInitialized, isRoleLoading, vulnData, error, hasSelectedRole, effectiveRole, buildRedirectUrl, router, showWelcome]);

  function handleConfirm(role: AppRole | null = chosenRole) {
    if (!role) return;
    if (role !== selectedRole) setSelectedRole(role);
    router.replace(buildRedirectUrl(role));
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        title={t("fetchVulnerabilitiesError")}
      />
    );
  }

  if (!isInitialized || isRoleLoading || (hasSelectedRole && !showWelcome)) {
    return (
      <VStack paddingBlock="space-24" align="center">
        <Loader size="large" title={tCommon("loading")} />
      </VStack>
    );
  }

  return (
    <VStack
      gap="space-28"
      paddingBlock="space-16"
      maxWidth="1160px"
      marginInline="auto"
    >
      <LandingExplanation />
      <Box as="section" aria-labelledby="get-started" padding="space-20" borderColor="neutral-subtle" borderWidth="1" borderRadius="12">
        <VStack gap="space-12">
          <Heading size="medium" level="2" id="get-started">{tWelcome("getStarted")}</Heading>
          <HGrid columns={{ xs: 1, lg: "minmax(0, 1fr) minmax(0, 2fr)" }} gap="space-24">
            <VStack as="section" gap="space-12" aria-labelledby="your-teams">
              <Label as="div" size="small" id="your-teams">{tWelcome("teams.title")}</Label>
              <Box asChild marginBlock="space-0">
                <List as="ol" size="small">
                  {(["nais", "teamkatalogen", "leadership"] as const).map((step) => (
                    <List.Item key={step}>
                      <Detail as="div" textColor="subtle">{tWelcome(`teams.steps.${step}`)}</Detail>
                    </List.Item>
                  ))}
                </List>
              </Box>
              <Detail as="div" textColor="subtle">{tWelcome("teams.missing")}</Detail>
              <Detail as="div" textColor="subtle">{tWelcome("teams.relevance")}</Detail>
            </VStack>
            <Fieldset legend={tWelcome("heading")} size="small">
              <VStack gap="space-8">
                <Detail as="div" textColor="subtle">{tWelcome("subheading")}</Detail>
                <HGrid columns={{ xs: 1, sm: "repeat(auto-fit, minmax(150px, 1fr))" }} gap="space-8">
                  {availableRoles.map((role) => (
                    <RoleCard
                      key={role}
                      role={role}
                      selected={chosenRole === role}
                      suggested={actualRole === role}
                      onSelect={setPendingRole}
                      onContinue={handleConfirm}
                    />
                  ))}
                </HGrid>
                <HStack justify="end">
                  <Button
                    variant="primary"
                    size="small"
                    disabled={!chosenRole}
                    onClick={() => handleConfirm()}
                  >
                    {chosenRole
                      ? tWelcome("selectButton", { role: tWelcome(`roles.${chosenRole}.title`) })
                      : tWelcome("selectPrompt")}
                  </Button>
                </HStack>
              </VStack>
            </Fieldset>
          </HGrid>
        </VStack>
      </Box>
    </VStack>
  );
}
