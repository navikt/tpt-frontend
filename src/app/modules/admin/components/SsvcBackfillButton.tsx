"use client";

import { useState } from "react";
import { Button, Modal, HStack, VStack, BodyShort, Alert } from "@navikt/ds-react";
import { ArrowsCirclepathIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";

export function SsvcBackfillButton() {
  const t = useTranslations("admin");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleTrigger = async () => {
    setIsTriggering(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/vulnrichment/backfill-ssvc", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to trigger SSVC backfill");
      }

      setResult({ ok: true, message: t("ssvcBackfillStarted") });
    } catch {
      setResult({ ok: false, message: t("ssvcBackfillError") });
    } finally {
      setIsTriggering(false);
      setIsModalOpen(false);
    }
  };

  return (
    <VStack gap="space-12">
      <Button
        variant="secondary"
        size="small"
        icon={<ArrowsCirclepathIcon aria-hidden />}
        onClick={() => setIsModalOpen(true)}
        loading={isTriggering}
      >
        {t("triggerSsvcBackfill")}
      </Button>

      {result && (
        <Alert variant={result.ok ? "success" : "error"} size="small">
          {result.message}
        </Alert>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        header={{ heading: t("triggerSsvcBackfill") }}
        width="small"
      >
        <Modal.Body>
          <BodyShort>{t("ssvcBackfillConfirmation")}</BodyShort>
        </Modal.Body>
        <Modal.Footer>
          <HStack gap="space-8">
            <Button onClick={handleTrigger} loading={isTriggering}>
              {t("confirm")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isTriggering}
            >
              {t("cancel")}
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal>
    </VStack>
  );
}
