"use client";

import { useState, useRef, useCallback } from "react";
import { Button, Heading, Box, Alert, BodyShort } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";

interface RemediationSectionProps {
  cveId: string;
  workloadName: string;
  environment: string;
  packageName: string;
  packageEcosystem?: string;
}

export function RemediationSection({
  cveId,
  workloadName,
  environment,
  packageName,
  packageEcosystem,
}: RemediationSectionProps) {
  const t = useTranslations("vulnerabilityDetail.remediation");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startRemediation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setContent("");
    setIsLoading(true);
    setIsDone(false);
    setError(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    (async () => {
      try {
        const response = await fetch("/api/vulnerabilities/remediation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cveId,
            workloadName,
            environment,
            packageName,
            packageEcosystem: packageEcosystem ?? "UNKNOWN",
          }),
          signal: abortController.signal,
        });

        if (!response.ok || !response.body) {
          setError(t("genericError"));
          setIsLoading(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            const lines = event.split("\n");
            let eventType = "message";
            let data = "";

            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventType = line.slice("event:".length).trim();
              } else if (line.startsWith("data:")) {
                data = line.slice("data:".length).trimStart();
              }
            }

            if (eventType === "done") {
              setIsLoading(false);
              setIsDone(true);
              return;
            } else if (eventType === "error") {
              let errorKey = "genericError";
              try {
                const parsed = JSON.parse(data);
                const errorKeyMap: Record<string, string> = {
                  ai_service_error: "aiServiceError",
                  data_fetch_error: "dataFetchError",
                  internal_error: "internalError",
                };
                errorKey = errorKeyMap[parsed.code] ?? "genericError";
              } catch {
                // malformed payload — use generic error
              }
              setError(t(errorKey as Parameters<typeof t>[0]));
              setIsLoading(false);
              return;
            } else if (data) {
              setContent((prev) => prev + data + "\n");
            }
          }
        }

        setIsLoading(false);
        setIsDone(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(t("connectionError"));
          setIsLoading(false);
        }
      }
    })();
  }, [cveId, workloadName, environment, packageName, packageEcosystem, t]);

  return (
    <Box style={{ marginBottom: "1.5rem" }}>
      <Heading size="medium" spacing>
        {t("title")}
      </Heading>

      {!isLoading && !content && !error && (
        <Button variant="secondary" onClick={startRemediation}>
          {t("generateButton")}
        </Button>
      )}

      {error && (
        <Alert variant="error" style={{ marginBottom: "1rem" }}>
          {error}
          <Button
            variant="tertiary"
            size="small"
            onClick={startRemediation}
            style={{ marginLeft: "0.5rem" }}
          >
            {t("retryButton")}
          </Button>
        </Alert>
      )}

      {(isLoading || content) && (
        <Box
          padding="space-16"
          borderRadius="4"
          background="neutral-soft"
          style={{ position: "relative" }}
        >
          {isLoading && !content && (
            <BodyShort style={{ color: "var(--ax-text-neutral-subtle)" }}>
              {t("generating")}
            </BodyShort>
          )}
          <div style={{ fontSize: "1rem", lineHeight: 1.6 }}>
            <ReactMarkdown>{content}</ReactMarkdown>
            {isLoading && <span>▋</span>}
          </div>
          {isDone && (
            <Button
              variant="tertiary"
              size="small"
              onClick={startRemediation}
              style={{ marginTop: "0.5rem" }}
            >
              {t("regenerateButton")}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
