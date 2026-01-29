"use client";

import { Box, Heading, BodyLong, Alert } from "@navikt/ds-react";
import { useTranslations } from "next-intl";

export default function NoTeamView() {
  const t = useTranslations("noTeamView");

  return (
    <Box
      paddingBlock={{ xs: "space-16", md: "space-24" }}
      paddingInline={{ xs: "space-16", md: "space-40" }}
    >
      <Box paddingBlock="space-24">
        <Heading size="large" level="1" spacing>
          {t("title")}
        </Heading>
        <BodyLong spacing>
          {t("description")}
        </BodyLong>
      </Box>

      <Alert variant="info">
        {t("message")}
      </Alert>
    </Box>
  );
}
