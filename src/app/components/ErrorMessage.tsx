"use client";

import { Alert, Box, BodyShort, CopyButton, HStack, VStack } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { ApiError, categorizeError, isReportableError } from "@/app/shared/utils/errorHandling";

interface ErrorMessageProps {
  error: ApiError;
  title?: string;
}

export function ErrorMessage({ error, title }: ErrorMessageProps) {
  const t = useTranslations();
  
  // If we have Problem Details from backend, use those
  const problemDetails = error.problemDetails;
  
  // Use Problem Details title if available, otherwise use error message
  const errorTitle = problemDetails?.title || 
    (error.message.startsWith("errors.") 
      ? t(error.message as "errors.networkError" | "errors.internalError" | "errors.badRequest")
      : error.message);
  
  // Use Problem Details detail if available, otherwise use error details
  const errorDetail = problemDetails?.detail || error.details;
  
  // Determine alert variant based on error category
  const category = categorizeError(error.status);
  const variant = category === "client" ? "warning" : "error";
  
  const shouldShowReportMessage = isReportableError(error);

  return (
    <Box paddingBlock="space-24">
      <Alert variant={variant}>
        <VStack gap="space-12">
          <Box>
            <BodyShort weight="semibold" spacing>
              {title || t("errors.title")}
            </BodyShort>
            <BodyShort spacing>{errorTitle}</BodyShort>
          </Box>
          
          {errorDetail && (
            <BodyShort size="small" style={{ opacity: 0.9 }}>
              {errorDetail}
            </BodyShort>
          )}
          
          {shouldShowReportMessage && error.traceId && (
            <BodyShort size="small" style={{ opacity: 0.9 }}>
              {t("errors.shouldReport")}
            </BodyShort>
          )}
          
          <HStack gap="space-16" wrap={false}>
            {error.status && (
              <BodyShort size="small" style={{ opacity: 0.7 }}>
                {t("common.statusCode")}: {error.status}
              </BodyShort>
            )}
            
            {problemDetails?.type && (
              <BodyShort size="small" style={{ opacity: 0.7, wordBreak: "break-all" }}>
                Type: {problemDetails.type}
              </BodyShort>
            )}
          </HStack>
          
          {problemDetails?.instance && (
            <BodyShort size="small" style={{ opacity: 0.7, wordBreak: "break-all" }}>
              Instance: {problemDetails.instance}
            </BodyShort>
          )}
          
          {error.traceId && (
            <HStack gap="space-8" align="center">
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
        </VStack>
      </Alert>
    </Box>
  );
}
