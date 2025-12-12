"use client";
import "./globals.css";
import { Page } from "@navikt/ds-react";
import { InternalHeader } from "@navikt/ds-react";
import { GlobalAlert } from "@navikt/ds-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Page>
          <InternalHeader>
            <InternalHeader.Title href="/">Titt på Ting</InternalHeader.Title>
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
