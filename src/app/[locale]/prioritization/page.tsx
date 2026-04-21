"use client";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import DeveloperView from "../views/DeveloperView";
import { ErrorMessage } from "@/app/components/ErrorMessage";
import { useTranslations } from "next-intl";

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

  return <DeveloperView />;
}
