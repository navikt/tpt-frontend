"use client";
import { Page, InternalHeader, GlobalAlert, Spacer } from "@navikt/ds-react";
import { useUser } from "../shared/hooks/useUser";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslations, useLocale } from "next-intl";
import { moduleNavLinks } from "../shared/navigation";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const t = useTranslations();
  const locale = useLocale();

  return (
    <Page>
      <InternalHeader>
        <InternalHeader.Title href={`/${locale}`}>{t("common.appTitle")}</InternalHeader.Title>
        {moduleNavLinks
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
