"use client";

import { Alert, Box, BodyShort, CopyButton, HStack } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { ApiError } from "@/app/shared/utils/errorHandling";

interface ErrorMessageProps {
  error: ApiError;
  title?: string;
}

export function ErrorMessage({ error, title }: ErrorMessageProps) {
  const t = useTranslations();
  
  // Check if error message is a translation key
  const errorMessage = error.message.startsWith("errors.")
    ? t(error.message as "errors.networkError" | "errors.internalError" | "errors.fetchApplicationsError" | "errors.fetchConfigError" | "errors.fetchVulnerabilitiesError")
    : error.message;

  return (
    <Box paddingBlock="space-24">
      <Alert variant="error">
        <Box>
          <BodyShort weight="semibold" spacing>
            {title || t("errors.title")}
          </BodyShort>
          <BodyShort spacing>{errorMessage}</BodyShort>
          {error.traceId && (
            <HStack gap="2" align="center">
              <BodyShort size="small" style={{ opacity: 0.8 }}>
                {t("errors.traceId")}: {error.traceId}
              </BodyShort>
              <CopyButton
                copyText={error.traceId}
                size="xsmall"
                text={t("errors.copyId")}
                activeText={t("errors.copiedId")}
              />
            </HStack>
          )}
        </Box>
      </Alert>
    </Box>
  );
}
