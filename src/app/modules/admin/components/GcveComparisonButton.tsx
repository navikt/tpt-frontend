"use client";

import { useState } from "react";
import {
  Button,
  Box,
  VStack,
  HStack,
  BodyShort,
  Heading,
  Table,
  Alert,
  Tag,
} from "@navikt/ds-react";
import { FileSearchIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format";
import { GcveComparisonReport } from "@/app/types/admin";

export function GcveComparisonButton() {
  const t = useTranslations("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<GcveComparisonReport | null>(null);

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/gcve/comparison");

      if (!response.ok) {
        throw new Error("Failed to fetch GCVE comparison");
      }

      const data: GcveComparisonReport = await response.json();
      setReport(data);
    } catch {
      setError(t("gcveComparisonError"));
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack gap="space-12">
      <Button
        variant="secondary"
        size="small"
        icon={<FileSearchIcon aria-hidden />}
        onClick={handleFetch}
        loading={isLoading}
      >
        {t("fetchGcveComparison")}
      </Button>

      {error && (
        <Alert variant="error" size="small">
          {error}
        </Alert>
      )}

      {report && (
        <Box
          background="neutral-soft"
          padding="space-16"
          borderRadius="8"
        >
          <VStack gap="space-16">
            <HStack gap="space-24" wrap>
              <VStack gap="space-4">
                <BodyShort size="small" style={{ opacity: 0.75 }}>
                  {t("gcveTotalTracked")}
                </BodyShort>
                <BodyShort weight="semibold">
                  {formatNumber(report.totalTrackedCves)}
                </BodyShort>
              </VStack>
              <VStack gap="space-4">
                <BodyShort size="small" style={{ opacity: 0.75 }}>
                  {t("gcveCovered")}
                </BodyShort>
                <BodyShort weight="semibold">
                  {formatNumber(report.gcveCoveredCount)}
                </BodyShort>
              </VStack>
              <VStack gap="space-4">
                <BodyShort size="small" style={{ opacity: 0.75 }}>
                  {t("gcveMissing")}
                </BodyShort>
                <BodyShort
                  weight="semibold"
                  style={{
                    color:
                      report.gcveMissingCount > 0
                        ? "var(--a-text-warning)"
                        : undefined,
                  }}
                >
                  {formatNumber(report.gcveMissingCount)}
                </BodyShort>
              </VStack>
              <VStack gap="space-4">
                <BodyShort size="small" style={{ opacity: 0.75 }}>
                  {t("gcveLastSync")}
                </BodyShort>
                <BodyShort weight="semibold">
                  {report.lastGcveSyncTimestamp
                    ? new Date(report.lastGcveSyncTimestamp).toLocaleString(
                        "nb-NO",
                      )
                    : t("gcveNeverSynced")}
                </BodyShort>
              </VStack>
            </HStack>

            {report.gcveMissingSample.length > 0 && (
              <Box>
                <Heading size="xsmall" level="3" spacing>
                  {t("gcveMissingSample", {
                    count: formatNumber(report.gcveMissingSample.length),
                  })}
                </Heading>
                <HStack gap="space-4" wrap>
                  {report.gcveMissingSample.map((cveId) => (
                    <Tag key={cveId} size="small" variant="neutral">
                      {cveId}
                    </Tag>
                  ))}
                </HStack>
              </Box>
            )}

            {report.cvssDiscrepancies.length > 0 && (
              <Box>
                <Heading size="xsmall" level="3" spacing>
                  {t("gcveCvssDiscrepancies", {
                    count: formatNumber(report.cvssDiscrepancies.length),
                  })}
                </Heading>
                <Table size="small">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell scope="col">
                        {t("cveId")}
                      </Table.HeaderCell>
                      <Table.HeaderCell scope="col" align="right">
                        {t("gcveNvdScore")}
                      </Table.HeaderCell>
                      <Table.HeaderCell scope="col" align="right">
                        {t("gcveGcveScore")}
                      </Table.HeaderCell>
                      <Table.HeaderCell scope="col">
                        {t("gcveNvdSeverity")}
                      </Table.HeaderCell>
                      <Table.HeaderCell scope="col">
                        {t("gcveGcveSeverity")}
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {report.cvssDiscrepancies.map((discrepancy) => (
                      <Table.Row key={discrepancy.cveId}>
                        <Table.DataCell>
                          <BodyShort weight="semibold">
                            {discrepancy.cveId}
                          </BodyShort>
                        </Table.DataCell>
                        <Table.DataCell align="right">
                          {discrepancy.nvdCvssV31Score}
                        </Table.DataCell>
                        <Table.DataCell align="right">
                          {discrepancy.gcveCvssV31Score}
                        </Table.DataCell>
                        <Table.DataCell>
                          {discrepancy.nvdSeverity ?? "–"}
                        </Table.DataCell>
                        <Table.DataCell>
                          {discrepancy.gcveSeverity ?? "–"}
                        </Table.DataCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Box>
            )}

            {report.gcveMissingCount === 0 &&
              report.cvssDiscrepancies.length === 0 && (
                <Alert variant="success" size="small">
                  {t("gcveNoDifferences")}
                </Alert>
              )}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}
