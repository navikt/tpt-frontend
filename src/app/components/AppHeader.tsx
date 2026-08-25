"use client";

import { InternalHeader, Spacer, Tabs, Button, BodyShort } from "@navikt/ds-react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useRoleContext } from "../shared/hooks/useRoleContext";
import { useUser } from "../shared/hooks/useUser";
import { navSections, type NavSection, type SubNavLink } from "../shared/navigation";
import { AvatarMenu } from "./AvatarMenu";
import { useSyncExternalStore } from "react";
import { PersonRectangleIcon } from "@navikt/aksel-icons";

function subscribe() { return () => {}; }
function getSnapshot() { return true; }
function getServerSnapshot() { return false; }

function useIsClient() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function filterByRole(
  allowedRoles: string[] | undefined,
  effectiveRole: string | null,
  actualRole: string | null
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (actualRole === "ADMIN") return true;
  if (!effectiveRole) return false;
  return allowedRoles.includes(effectiveRole);
}

export function AppHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { effectiveRole, actualRole, isLoading: isRoleLoading, setSelectedRole } = useRoleContext();
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const isClient = useIsClient();

  const filterParams = searchParams.toString();

  function href(path: string) {
    return filterParams ? `/${locale}${path}?${filterParams}` : `/${locale}${path}`;
  }

  const visibleSections: NavSection[] = !isClient || isRoleLoading
    ? []
    : navSections
        .filter((s) => filterByRole(s.allowedRoles, effectiveRole ?? null, actualRole ?? null))
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
        .filter((sub) => filterByRole(sub.allowedRoles, effectiveRole ?? null, actualRole ?? null))
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const showSubNav = visibleSubLinks.length > 1;

  // Active sub-link path for Tabs value
  const activeSubPath = visibleSubLinks.find((sub) =>
    pathname.startsWith(`/${locale}${sub.path}`)
  )?.path;

  return (
    <>
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
                color: isActive ? "white" : "rgb(223, 225, 229)",
                textDecoration: isActive ? "underline" : "none",
                textUnderlineOffset: "4px",
              }}
            >
              {t(section.labelKey)}
            </InternalHeader.Title>
          );
        })}

        <Spacer />
        {isClient && !isRoleLoading && (
          <Button
            variant="tertiary"
            size="small"
            icon={<PersonRectangleIcon aria-hidden />}
            onClick={() => {
              setSelectedRole(null);
              router.push(`/${locale}`);
            }}
          >
            <BodyShort size="small">{t("roleContext.changeRole")}</BodyShort>
          </Button>
        )}
        {!isUserLoading && user && <AvatarMenu email={user.email} />}
      </InternalHeader>

      {showSubNav && (
        <div
          style={{
            borderBottom: "1px solid var(--a-border-subtle)",
            background: "var(--a-bg-default)",
            paddingInline: "var(--a-spacing-4)",
          }}
        >
          <Tabs value={activeSubPath ?? visibleSubLinks[0]?.path ?? ""} onChange={() => {}}>
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
