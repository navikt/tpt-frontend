"use client";
import { Page, InternalHeader, GlobalAlert, Spacer } from "@navikt/ds-react";
import { useUser } from "../shared/hooks/useUser";
import { useRoleContext, RoleContextProvider } from "../shared/hooks/useRoleContext";
import { SettingsPanel } from "../components/SettingsPanel";
import { useTranslations, useLocale } from "next-intl";
import { moduleNavLinks } from "../shared/navigation";

function LocaleLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isUserLoading } = useUser();
  const { effectiveRole, actualRole, isLoading: isRoleLoading } = useRoleContext();
  const t = useTranslations();
  const locale = useLocale();

  // Don't filter nav links until role data is loaded to avoid hydration mismatch
  const filteredNavLinks = isRoleLoading 
    ? []
    : moduleNavLinks.filter((link) => {
        if (!link.allowedRoles || link.allowedRoles.length === 0) {
          return true;
        }
        
        // For ADMIN role, check actualRole (not overridable by context switcher)
        if (link.allowedRoles.includes("ADMIN")) {
          return actualRole === "ADMIN";
        }
        
        // For other roles, check effectiveRole (can be overridden)
        if (!effectiveRole) {
          return false;
        }
        return link.allowedRoles.includes(effectiveRole);
      });

  return (
    <Page>
      <InternalHeader>
        <InternalHeader.Title href={`/${locale}`}>{t("common.appTitle")}</InternalHeader.Title>
        {filteredNavLinks
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
          .map((link) => (
            <InternalHeader.Title
              key={link.path}
              href={`/${locale}${link.path}`}
              style={{ fontWeight: 400, color: "rgb(223, 225, 229)" }}
            >
              {t(link.labelKey)}
            </InternalHeader.Title>
          ))}
        <Spacer />
        <SettingsPanel />
        {!isUserLoading && user && (
          <div style={{ display: "flex", alignItems: "center", paddingLeft: "1rem" }}>
            <InternalHeader.User name={user.email} description="" />
          </div>
        )}
      </InternalHeader>
      <GlobalAlert status="announcement">
        <GlobalAlert.Header>
          <GlobalAlert.Title>
            {t("banner.underDevelopment")}
          </GlobalAlert.Title>
        </GlobalAlert.Header>
      </GlobalAlert>
      <Page.Block as="main" width="lg" gutters>
        {children}
      </Page.Block>
    </Page>
  );
}

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleContextProvider>
      <LocaleLayoutContent>{children}</LocaleLayoutContent>
    </RoleContextProvider>
  );
}
