"use client";
import { Page, InternalHeader, GlobalAlert, Spacer } from "@navikt/ds-react";
import { useUser } from "../shared/hooks/useUser";
import { useRoleContext, RoleContextProvider } from "../shared/hooks/useRoleContext";
import { SettingsPanel } from "../components/SettingsPanel";
import { useTranslations, useLocale } from "next-intl";
import { moduleNavLinks } from "../shared/navigation";
import { Providers } from "../contexts/Providers";
import { useSyncExternalStore } from "react";

function subscribe() { return () => {}; }
function getSnapshot() { return true; }
function getServerSnapshot() { return false; }

function useIsClient() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function LocaleLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isUserLoading } = useUser();
  const { effectiveRole, actualRole, isLoading: isRoleLoading } = useRoleContext();
  const t = useTranslations();
  const locale = useLocale();
  const isClient = useIsClient();
  // Render nav links only after client mount to avoid hydration mismatch,
  // since role data is client-only (localStorage + API fetch)
  const filteredNavLinks = !isClient || isRoleLoading
    ? []
    : moduleNavLinks.filter((link) => {
        if (!link.allowedRoles || link.allowedRoles.length === 0) {
          return true;
        }
        
        if (link.allowedRoles.includes("ADMIN")) {
          return actualRole === "ADMIN";
        }
        
        if (!effectiveRole) {
          return false;
        }
        return link.allowedRoles.includes(effectiveRole);
      });

  return (
    <Page>
      <InternalHeader>
        <InternalHeader.Title>{t("common.appTitle")}</InternalHeader.Title>
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
    <Providers>
      <RoleContextProvider>
        <LocaleLayoutContent>{children}</LocaleLayoutContent>
      </RoleContextProvider>
    </Providers>
  );
}
