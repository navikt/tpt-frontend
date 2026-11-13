"use client";

import { createContext, useContext, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BodyShort, Box, Button, HStack, InlineMessage, Link as AkselLink, LocalAlert } from "@navikt/ds-react";
import { RobotIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";
import { useCopilotRemediations } from "@/app/shared/hooks/useCopilotRemediations";
import type {
  CopilotOutcome,
  CopilotRemediation,
  CopilotRemediationStartRequest,
  CopilotRemediationStartResponse,
} from "@/app/shared/types/copilotRemediation";
import type { Vulnerability } from "@/app/shared/types/vulnerabilities";
import {
  COPILOT_OUTCOME_PARAM,
  COPILOT_STATUS_PARAM,
  copilotErrorKey,
  packageIdentity,
  withoutCopilotOutcome,
} from "@/app/shared/utils/copilotRemediation";

interface CopilotRemediationsContextValue {
  repository: string;
  enabled: boolean;
  remediations: CopilotRemediation[];
  reload: () => void;
}

const CopilotRemediationsContext = createContext<CopilotRemediationsContextValue | null>(null);

export function CopilotRemediationsProvider({
  repository,
  active = true,
  children,
}: {
  repository?: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  const { enabled, remediations, reload } = useCopilotRemediations(repository, active);
  const value = repository ? { repository, enabled, remediations, reload } : null;
  return (
    <CopilotRemediationsContext.Provider value={value}>{children}</CopilotRemediationsContext.Provider>
  );
}

function currentReturnPath() {
  return withoutCopilotOutcome(`${window.location.pathname}${window.location.search}`);
}

export function CopilotFixButton({
  vulnerability,
  workloadId,
}: {
  vulnerability: Pick<Vulnerability, "identifier" | "packageName" | "dependabotUpdatePullRequestUrl">;
  workloadId?: string;
}) {
  const t = useTranslations("copilot");
  const context = useContext(CopilotRemediationsContext);
  const [isStarting, setIsStarting] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  if (!context?.enabled || vulnerability.dependabotUpdatePullRequestUrl) return null;

  const remediation = context.remediations.find(
    (item) =>
      item.vulnerabilityIdentifier === vulnerability.identifier &&
      packageIdentity(item.packageName) === packageIdentity(vulnerability.packageName),
  );

  const start = async (force: boolean) => {
    setIsStarting(true);
    setErrorKey(null);
    const request: CopilotRemediationStartRequest = {
      repository: context.repository,
      vulnerabilityIdentifier: vulnerability.identifier,
      packageName: vulnerability.packageName || undefined,
      workloadId,
      returnPath: currentReturnPath(),
      force,
    };
    try {
      const response = await fetch("/api/remediations/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        setErrorKey(copilotErrorKey(response.status));
        setIsStarting(false);
        return;
      }
      const body: CopilotRemediationStartResponse = await response.json();
      if (body.authorizeUrl) {
        window.location.assign(body.authorizeUrl);
        return;
      }
      context.reload();
      setIsStarting(false);
    } catch (error) {
      console.warn("Could not start Copilot remediation", error);
      setErrorKey(copilotErrorKey());
      setIsStarting(false);
    }
  };

  return (
    <HStack gap="space-8" align="center" wrap>
      {remediation ? (
        <>
          {remediation.taskUrl ? (
            <AkselLink href={remediation.taskUrl} target="_blank" rel="noopener noreferrer">
              <RobotIcon aria-hidden />
              {t("taskStarted")}
            </AkselLink>
          ) : (
            <BodyShort size="small">{t("taskStarting")}</BodyShort>
          )}
          <Button variant="tertiary" size="xsmall" loading={isStarting} onClick={() => start(true)}>
            {t("startAgain")}
          </Button>
        </>
      ) : (
        <Button
          variant="secondary"
          size="xsmall"
          icon={<RobotIcon aria-hidden />}
          loading={isStarting}
          onClick={() => start(false)}
        >
          {t("fixButton")}
        </Button>
      )}
      {errorKey && (
        <InlineMessage status="error" size="small">
          {t(errorKey)}
        </InlineMessage>
      )}
    </HStack>
  );
}

const outcomeStatus: Record<CopilotOutcome, "success" | "announcement" | "warning" | "error"> = {
  started: "success",
  alreadyStarted: "announcement",
  cancelled: "warning",
  error: "error",
};

function isCopilotOutcome(value: string | null): value is CopilotOutcome {
  return value !== null && value in outcomeStatus;
}

export function CopilotRemediationAlert() {
  const t = useTranslations("copilot");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const outcome = searchParams.get(COPILOT_OUTCOME_PARAM);

  if (!isCopilotOutcome(outcome)) return null;

  const status = Number(searchParams.get(COPILOT_STATUS_PARAM)) || undefined;
  const message = outcome === "error" ? t(copilotErrorKey(status)) : t(`outcome.${outcome}`);

  const close = () => {
    const query = searchParams.toString();
    router.replace(withoutCopilotOutcome(query ? `${pathname}?${query}` : pathname), { scroll: false });
  };

  return (
    <Box paddingBlock="space-16 space-0">
      <LocalAlert status={outcomeStatus[outcome]} size="small" as="div">
        <LocalAlert.Header>
          <LocalAlert.Title as="div">{t("alertTitle")}</LocalAlert.Title>
          <LocalAlert.CloseButton onClick={close} />
        </LocalAlert.Header>
        <LocalAlert.Content>{message}</LocalAlert.Content>
      </LocalAlert>
    </Box>
  );
}
