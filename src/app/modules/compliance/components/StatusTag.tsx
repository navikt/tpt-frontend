"use client";

import { Tag } from "@navikt/ds-react";
import {
  CheckmarkCircleFillIcon,
  ExclamationmarkTriangleFillIcon,
  XMarkOctagonFillIcon,
} from "@navikt/aksel-icons";
import { useTranslations, useLocale } from "next-intl";
import type { SecurityStatusColor } from "@/app/types/securityStatus";
import { formatSince } from "../utils/complianceFormatters";

interface StatusTagProps {
  status: SecurityStatusColor;
  since?: string;
  size?: "small" | "medium";
}

export function StatusTag({ status, since, size = "small" }: StatusTagProps) {
  const t = useTranslations("complianceStatus");
  const locale = useLocale();

  const sinceText = formatSince(since, locale);

  const tagStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    maxWidth: "100%",
  };

  if (status === "green") {
    return (
      <Tag
        variant="moderate"
        data-color="success"
        size={size}
        icon={<CheckmarkCircleFillIcon aria-hidden />}
        style={tagStyle}
      >
        <span style={{ whiteSpace: "nowrap" }}>{t("onTrack")}</span>
      </Tag>
    );
  }

  if (status === "yellow") {
    return (
      <Tag
        variant="moderate"
        data-color="warning"
        size={size}
        icon={<ExclamationmarkTriangleFillIcon aria-hidden />}
        style={tagStyle}
      >
        <span style={{ whiteSpace: "nowrap" }}>{t("needsAttention")}</span>
        {sinceText && (
          <span style={{ marginLeft: "4px", whiteSpace: "nowrap" }}>
            · {sinceText}
          </span>
        )}
      </Tag>
    );
  }

  return (
    <Tag
      variant="moderate"
      data-color="danger"
      size={size}
      icon={<XMarkOctagonFillIcon aria-hidden />}
      style={tagStyle}
    >
      <span style={{ whiteSpace: "nowrap" }}>{t("actNow")}</span>
      {sinceText && (
        <span style={{ marginLeft: "4px", whiteSpace: "nowrap" }}>
          · {sinceText}
        </span>
      )}
    </Tag>
  );
}
