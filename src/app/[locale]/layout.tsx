"use client";
import { Page, InternalHeader, GlobalAlert, Spacer } from "@navikt/ds-react";
import { useUser } from "../hooks/useUser";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const t = useTranslations();

  return (
    <Page>
      <InternalHeader>
        <InternalHeader.Title href="/">{t("common.appTitle")}</InternalHeader.Title>
        <InternalHeader.Title
          href="/vulnerabilities"
          style={{ fontWeight: 400, color: "rgb(223, 225, 229)" }}
        >
          {t("header.allVulnerabilities")}
        </InternalHeader.Title>
        <Spacer />
        <LanguageSwitcher />
        {!isLoading && user && (
          <InternalHeader.User name={user.email} description="" />
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
