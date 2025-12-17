"use client";
import "./globals.css";
import { Page } from "@navikt/ds-react";
import { InternalHeader } from "@navikt/ds-react";
import { GlobalAlert } from "@navikt/ds-react";
import { useUser } from "./hooks/useUser";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useUser();

  return (
    <html lang="en">
      <body>
        <Page>
          <InternalHeader>
            <InternalHeader.Title href="/">Titt på Ting</InternalHeader.Title>
            <InternalHeader.Title
              href="/vulnerabilities"
              style={{ fontWeight: 400, color: "rgb(223, 225, 229)" }}
            >
              Sårbarheter
            </InternalHeader.Title>
            {!isLoading && user && (
              <InternalHeader.User name={user.email} description="" />
            )}
          </InternalHeader>
          <GlobalAlert status="announcement">
            <GlobalAlert.Header>
              <GlobalAlert.Title>
                TPT er under aktiv utvikling. Ting kan brekke plutselig! 🚧
              </GlobalAlert.Title>
            </GlobalAlert.Header>
          </GlobalAlert>
          <Page.Block as="main" width="lg" gutters>
            {children}
          </Page.Block>
        </Page>
      </body>
    </html>
  );
}
