"use client";

import { Tag } from "@navikt/ds-react";
import {
  CheckmarkCircleFillIcon,
  ExclamationmarkTriangleFillIcon,
  XMarkOctagonFillIcon,
} from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";
import type { SecurityStatusColor } from "@/app/types/securityStatus";

interface StatusTagProps {
  status: SecurityStatusColor;
  size?: "small" | "medium";
}

export function StatusTag({ status, size = "small" }: StatusTagProps) {
  const t = useTranslations("complianceStatus");

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
        {t("onTrack")}
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
        {t("needsAttention")}
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
      {t("actNow")}
    </Tag>
  );
}
