"use client";
import { useMemo } from "react";
import { useConfig } from "@/app/shared/hooks/useConfig";
import { useVulnerabilities } from "@/app/modules/vulnerabilities/hooks/useVulnerabilities";
import { BodyShort, Loader, Box, Heading, VStack, HGrid } from "@navikt/ds-react";
import { useTranslations } from "next-intl";

export default function TeamMemberView() {
  const t = useTranslations("teamMemberView");
  const { config, isLoading: configLoading } = useConfig();
  const { data: vulnData, isLoading: dataLoading } = useVulnerabilities();

  const statistics = useMemo(() => {
    if (!vulnData || !config) return null;

    const totalWorkloads = vulnData.teams.reduce(
      (sum, team) => sum + team.workloads.length,
      0
    );

    const allVulnerabilities = vulnData.teams.flatMap((team) =>
      team.workloads.flatMap((workload) => workload.vulnerabilities)
    );

    const totalVulnerabilities = allVulnerabilities.length;

    const highPriority = allVulnerabilities.filter(
      (v) => v.riskScore >= config.thresholds.high
    ).length;

    const mediumPriority = allVulnerabilities.filter(
      (v) =>
        v.riskScore >= config.thresholds.medium &&
        v.riskScore < config.thresholds.high
    ).length;

    const lowPriority = allVulnerabilities.filter(
      (v) =>
        v.riskScore >= config.thresholds.low &&
        v.riskScore < config.thresholds.medium
    ).length;

    const veryLowPriority = allVulnerabilities.filter(
      (v) => v.riskScore < config.thresholds.low
    ).length;

    return {
      totalWorkloads,
      totalVulnerabilities,
      highPriority,
      mediumPriority,
      lowPriority,
      veryLowPriority,
    };
  }, [vulnData, config]);

  if (configLoading || dataLoading || !statistics) {
    return (
      <Box paddingBlock={{ xs: "space-16", md: "space-24" }}>
        <main>
          <VStack gap="6">
            <div>
              <Heading size="large" level="1">
                {t("title")}
              </Heading>
              <BodyShort spacing>
                {t("loadingStatistics")}
              </BodyShort>
            </div>
            <Box
              padding="space-24"
              borderRadius="large"
              background="surface-subtle"
              style={{ textAlign: "center" }}
            >
              <Loader size="large" title={t("loadingData")} />
            </Box>
          </VStack>
        </main>
      </Box>
    );
  }

  return (
    <Box paddingBlock={{ xs: "space-16", md: "space-24" }}>
      <main>
        <VStack gap="8">
          <div>
            <Heading size="large" level="1" spacing>
              {t("title")}
            </Heading>
            <BodyShort spacing>
              {t("description")}
            </BodyShort>
          </div>

          <HGrid columns={{ xs: 1, sm: 2 }} gap="4">
            <Box
              padding="space-24"
              borderRadius="large"
              background="surface-subtle"
            >
              <VStack gap="2">
                <BodyShort size="small" textColor="subtle">
                  {t("totalApplications")}
                </BodyShort>
                <Heading size="xlarge" level="2">
                  {statistics.totalWorkloads}
                </Heading>
              </VStack>
            </Box>

            <Box
              padding="space-24"
              borderRadius="large"
              background="surface-subtle"
            >
              <VStack gap="2">
                <BodyShort size="small" textColor="subtle">
                  {t("totalVulnerabilities")}
                </BodyShort>
                <Heading size="xlarge" level="2">
                  {statistics.totalVulnerabilities}
                </Heading>
              </VStack>
            </Box>
          </HGrid>

          <Box
            padding="space-24"
            borderRadius="large"
            background="surface-default"
            borderWidth="1"
            borderColor="border-subtle"
          >
            <VStack gap="6">
              <Heading size="medium" level="2">
                {t("vulnerabilitiesByPriority")}
              </Heading>

              <HGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="4">
                <Box
                  padding="space-16"
                  borderRadius="medium"
                  background="surface-danger-subtle"
                >
                  <VStack gap="2">
                    <BodyShort size="small" weight="semibold">
                      {t("highPriority")}
                    </BodyShort>
                    <Heading size="large" level="3">
                      {statistics.highPriority}
                    </Heading>
                  </VStack>
                </Box>

                <Box
                  padding="space-16"
                  borderRadius="medium"
                  background="surface-warning-subtle"
                >
                  <VStack gap="2">
                    <BodyShort size="small" weight="semibold">
                      {t("shouldHandle")}
                    </BodyShort>
                    <Heading size="large" level="3">
                      {statistics.mediumPriority}
                    </Heading>
                  </VStack>
                </Box>

                <Box
                  padding="space-16"
                  borderRadius="medium"
                  background="surface-info-subtle"
                >
                  <VStack gap="2">
                    <BodyShort size="small" weight="semibold">
                      {t("whenTime")}
                    </BodyShort>
                    <Heading size="large" level="3">
                      {statistics.lowPriority}
                    </Heading>
                  </VStack>
                </Box>

                <Box
                  padding="space-16"
                  borderRadius="medium"
                  background="surface-subtle"
                >
                  <VStack gap="2">
                    <BodyShort size="small" weight="semibold">
                      {t("lowPriority")}
                    </BodyShort>
                    <Heading size="large" level="3">
                      {statistics.veryLowPriority}
                    </Heading>
                  </VStack>
                </Box>
              </HGrid>
            </VStack>
          </Box>

          {statistics.highPriority === 0 && (
            <Box
              padding="space-24"
              borderRadius="large"
              background="surface-success-subtle"
              style={{ textAlign: "center" }}
            >
              <Heading size="medium" level="2">
                {t("noCriticalVulnerabilities")}
              </Heading>
              <BodyShort>
                {t("noCriticalDescription")}
              </BodyShort>
            </Box>
          )}
        </VStack>
      </main>
    </Box>
  );
}
