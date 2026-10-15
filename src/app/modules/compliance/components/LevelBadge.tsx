"use client";

import { Tag } from "@navikt/ds-react";
import { ExclamationmarkTriangleFillIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";
import type { SecurityLevel } from "@/app/types/securityStatus";

interface LevelBadgeProps {
  level: SecurityLevel;
  size?: "small" | "medium";
}

export function LevelBadge({ level, size = "small" }: LevelBadgeProps) {
  const t = useTranslations("complianceLevel");

  if (!level) return null;

  if (level === "new") {
    return (
      <Tag variant="moderate" data-color="info" size={size}>
        {t("new")}
      </Tag>
    );
  }

  if (level === "ongoing") {
    return (
      <Tag variant="moderate" data-color="warning" size={size}>
        {t("ongoing")}
      </Tag>
    );
  }

  return (
    <Tag
      variant="strong"
      data-color="danger"
      size={size}
      icon={<ExclamationmarkTriangleFillIcon aria-hidden />}
    >
      {t("chronic")}
    </Tag>
  );
}
