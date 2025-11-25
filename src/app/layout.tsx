"use client";
import "./globals.css";
import { Page } from "@navikt/ds-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Page>
          <Page.Block as="main" width="lg">
            {children}
          </Page.Block>
        </Page>
      </body>
    </html>
  );
}
