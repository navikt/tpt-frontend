"use client";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import DeveloperView from "../views/DeveloperView";
import { ErrorMessage } from "@/app/components/ErrorMessage";
import { useTranslations } from "next-intl";
import { VStack } from "@navikt/ds-react";
import { DataSourceNote } from "@/app/shared/components/DataSourceNote";

export default function PrioritizationPage() {
  const { error } = useVulnerabilitiesContext();
  const t = useTranslations("errors");

  if (error) {
    return (
      <ErrorMessage
        error={error}
        title={t("fetchVulnerabilitiesError")}
      />
    );
  }

  return (
    <VStack gap="space-16">
      <DataSourceNote tab="prioritization" />
      <DeveloperView />
    </VStack>
  );
}
