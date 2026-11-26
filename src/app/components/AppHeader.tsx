"use client";

import {
  InternalHeader,
  Spacer,
  Tabs,
  HStack,
} from "@navikt/ds-react";
import NextLink from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { ALL_ROLES } from "../shared/contexts/RoleContext";
import { useRoleContext } from "../shared/hooks/useRoleContext";
import { useUser } from "../shared/hooks/useUser";
import {
  navSections,
  type NavSection,
  type SubNavLink,
} from "../shared/navigation";
import { AvatarMenu } from "./AvatarMenu";
import { useSyncExternalStore } from "react";
import { useVulnerabilitiesContext } from "../contexts/VulnerabilitiesContext";
import { serializeFilters } from "../modules/vulnerabilities/utils/queryParamHelpers";
import WorkContextFilter from "./WorkContextFilter";

function subscribe() {
  return () => {};
}
function getSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

function useIsClient() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function filterByRole(
  allowedRoles: string[] | undefined,
  effectiveRole: string | null
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!effectiveRole) return false;
  return allowedRoles.includes(effectiveRole);
}

export function AppHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const isStartPage = pathname === `/${locale}` || pathname === `/${locale}/`;
  const {
    effectiveRole,
    isLoading: isRoleLoading,
  } = useRoleContext();
  const { user, isLoading: isUserLoading } = useUser();
  const isClient = useIsClient();
  const displayRole = ALL_ROLES.find((role) => role === effectiveRole);

  const { teamFilters, applicationFilters } = useVulnerabilitiesContext();
  const globalFilterParams = new URLSearchParams();
  const teamParam = serializeFilters(teamFilters);
  const applicationParam = serializeFilters(applicationFilters);
  if (teamParam) globalFilterParams.set("team", teamParam);
  if (applicationParam) globalFilterParams.set("app", applicationParam);
  const filterParams = globalFilterParams.toString();

  function href(path: string) {
    return filterParams
      ? `/${locale}${path}?${filterParams}`
      : `/${locale}${path}`;
  }

  const visibleSections: NavSection[] =
    !isClient || isRoleLoading
      ? []
      : navSections
          .filter((s) =>
            filterByRole(
              s.allowedRoles,
              effectiveRole ?? null
            )
          )
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  // Determine the active section: the one whose path (or any sub-link path) matches the current pathname
  const activeSection = visibleSections.find((section) => {
    if (section.subLinks && section.subLinks.length > 0) {
      return section.subLinks.some((sub) =>
        pathname.startsWith(`/${locale}${sub.path}`)
      );
    }
    return pathname.startsWith(`/${locale}${section.path}`);
  });

  // Sub-links for the active section, filtered by role
  const visibleSubLinks: SubNavLink[] = !activeSection?.subLinks
    ? []
    : activeSection.subLinks
        .filter((sub) =>
          filterByRole(
            sub.allowedRoles,
            effectiveRole ?? null
          )
        )
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const showSubNav = visibleSubLinks.length > 1;

  // Active sub-link path for Tabs value
  const activeSubPath = visibleSubLinks.find((sub) =>
    pathname.startsWith(`/${locale}${sub.path}`)
  )?.path;

  return (
    <>
      <HStack asChild wrap={isStartPage}>
        <InternalHeader>
          <InternalHeader.Title href={href("")}>
            {t("common.appTitle")}
          </InternalHeader.Title>

          {visibleSections.map((section) => {
            const sectionPath = section.subLinks?.[0]?.path ?? section.path;
            const isActive = section === activeSection;
            return (
              <InternalHeader.Title
                key={section.path}
                href={href(sectionPath)}
                aria-current={isActive ? "page" : undefined}
                style={{
                  fontWeight: isActive ? 600 : 400,
                  color: isStartPage ? "var(--ax-text-neutral)" : isActive ? "white" : "rgb(223, 225, 229)",
                  textDecoration: isActive ? "underline" : "none",
                  textUnderlineOffset: "4px",
                }}
              >
                {t(section.labelKey)}
              </InternalHeader.Title>
            );
          })}

          <Spacer />
          <WorkContextFilter />
          <InternalHeader.Title
            as={NextLink}
            href={`/${locale}?welcome=true${filterParams ? `&${filterParams}` : ""}`}
          >
            {isClient && !isRoleLoading && displayRole
              ? t("roleContext.viewingAs", { role: t(`roleContext.${displayRole}`) })
              : t("roleContext.chooseRole")}
          </InternalHeader.Title>
          {!isUserLoading && user && <AvatarMenu email={user.email} />}
        </InternalHeader>
      </HStack>

      {showSubNav && (
        <div
          style={{
            borderBottom: "1px solid var(--a-border-subtle)",
            background: "var(--a-bg-default)",
            paddingInline: "var(--a-spacing-4)",
          }}
        >
          <Tabs
            value={activeSubPath ?? visibleSubLinks[0]?.path ?? ""}
            onChange={() => {}}
          >
            <Tabs.List>
              {visibleSubLinks.map((sub) => (
                <Tabs.Tab
                  key={sub.path}
                  value={sub.path}
                  label={t(sub.labelKey)}
                  as="a"
                  href={href(sub.path)}
                />
              ))}
            </Tabs.List>
          </Tabs>
        </div>
      )}
    </>
  );
}
