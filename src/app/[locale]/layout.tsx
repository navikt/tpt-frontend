"use client";
import { Page, GlobalAlert, Alert } from "@navikt/ds-react";
import { RoleContextProvider } from "../shared/hooks/useRoleContext";
import { FeedbackButton } from "../components/FeedbackButton";
import { useTranslations } from "next-intl";
import { Providers } from "../contexts/Providers";
import { usePathname } from "next/navigation";
import { useVulnerabilitiesContext } from "../contexts/VulnerabilitiesContext";
import { AppHeader } from "../components/AppHeader";
import styles from "./layout.module.css";

function LocaleLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSyncing } = useVulnerabilitiesContext();
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <Page>
      <AppHeader />
      {!pathname.includes("/prioritization") && (
        <GlobalAlert status="announcement" className={styles.devBanner}>
          <GlobalAlert.Header>
            <GlobalAlert.Title>
              {t("banner.underDevelopment")}
            </GlobalAlert.Title>
          </GlobalAlert.Header>
        </GlobalAlert>
      )}
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
