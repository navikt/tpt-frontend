"use client";
import { Page, InternalHeader, GlobalAlert, Spacer, Alert } from "@navikt/ds-react";
import { useUser } from "../shared/hooks/useUser";
import { useRoleContext, RoleContextProvider } from "../shared/hooks/useRoleContext";
import { SettingsPanel } from "../components/SettingsPanel";
import { FeedbackButton } from "../components/FeedbackButton";
import { useTranslations, useLocale } from "next-intl";
import { moduleNavLinks } from "../shared/navigation";
import { Providers } from "../contexts/Providers";
import { useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { useVulnerabilitiesContext } from "../contexts/VulnerabilitiesContext";

function subscribe() { return () => {}; }
function getSnapshot() { return true; }
function getServerSnapshot() { return false; }

function useIsClient() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function LocaleLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isUserLoading } = useUser();
  const { effectiveRole, actualRole, isLoading: isRoleLoading } = useRoleContext();
  const { isSyncing } = useVulnerabilitiesContext();
  const t = useTranslations();
  const locale = useLocale();
  const isClient = useIsClient();
  const searchParams = useSearchParams();

  // Render nav links only after client mount to avoid hydration mismatch,
  // since role data is client-only (localStorage + API fetch)
  const filteredNavLinks = !isClient || isRoleLoading
    ? []
    : moduleNavLinks.filter((link) => {
        if (!link.allowedRoles || link.allowedRoles.length === 0) {
          return true;
        }
        // ADMIN sees everything
        if (actualRole === "ADMIN") {
          return true;
        }
        if (!effectiveRole) {
          return false;
        }
        return link.allowedRoles.includes(effectiveRole);
      });

  const filterParams = searchParams.toString();

  return (
    <Page>
      <InternalHeader>
        <InternalHeader.Title href={filterParams ? `/${locale}?${filterParams}` : `/${locale}`}>
          {t("common.appTitle")}
        </InternalHeader.Title>
        {filteredNavLinks
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
          .map((link) => {
            const href = filterParams
              ? `/${locale}${link.path}?${filterParams}`
              : `/${locale}${link.path}`;
            return (
              <InternalHeader.Title
                key={link.path}
                href={href}
                style={{ fontWeight: 400, color: "rgb(223, 225, 229)" }}
              >
                {t(link.labelKey)}
              </InternalHeader.Title>
            );
          })}
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
      {isSyncing && (
        <Alert variant="info" size="small" style={{ borderRadius: 0 }}>
          {t("sync.fetchingInBackground")}
        </Alert>
      )}
      <Page.Block as="main" width="lg" gutters>
        {children}
      </Page.Block>
      <FeedbackButton />
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
