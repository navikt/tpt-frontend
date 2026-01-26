"use client";
import { Page, InternalHeader, GlobalAlert, Spacer } from "@navikt/ds-react";
import { useUser } from "../shared/hooks/useUser";
import { useVulnerabilities } from "../modules/vulnerabilities/hooks/useVulnerabilities";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslations, useLocale } from "next-intl";
import { moduleNavLinks } from "../shared/navigation";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const { data: vulnData } = useVulnerabilities();
  const t = useTranslations();
  const locale = useLocale();

  const userRole = vulnData?.userRole;

  const filteredNavLinks = moduleNavLinks.filter((link) => {
    if (!link.allowedRoles || link.allowedRoles.length === 0) {
      return true;
    }
    if (!userRole) {
      return false;
    }
    return link.allowedRoles.includes(userRole);
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
