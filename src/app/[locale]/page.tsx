"use client";
import { useRoleContext } from "@/app/shared/hooks/useRoleContext";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import { Loader, Box } from "@navikt/ds-react";
import { ErrorMessage } from "@/app/components/ErrorMessage";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: vulnData, error } = useVulnerabilitiesContext();
  const { actualRole, isInitialized, isLoading: isRoleLoading } = useRoleContext();
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized || isRoleLoading || !vulnData) return;

    if (actualRole === "DEVELOPER" || actualRole === "ADMIN") {
      router.replace(`/${locale}/prioritization`);
    } else {
      router.replace(`/${locale}/compliance`);
    }
  }, [isInitialized, isRoleLoading, vulnData, actualRole, locale, router]);

  if (error) {
    return (
      <ErrorMessage
        error={error}
        title={t("fetchVulnerabilitiesError")}
      />
    );
  }

  return (
    <Box
      paddingBlock="space-24"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <Loader size="large" title={tCommon("loading")} />
    </Box>
  );
}
