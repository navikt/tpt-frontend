"use client";

import { Select } from "@navikt/ds-react";
import { useRoleContext } from "../shared/hooks/useRoleContext";
import { useTranslations } from "next-intl";

function RoleContextSwitcherInner() {
  const { setSelectedRole, actualRole, effectiveRole } = useRoleContext();
  const t = useTranslations("roleContext");

  const roles = [
    { value: "DEVELOPER", label: t("developer") },
    { value: "TEAM_MEMBER", label: t("teamMember") },
    { value: "LEADER", label: t("leader") },
    { value: "NONE", label: t("none") },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole === actualRole) {
      setSelectedRole(null);
    } else {
      setSelectedRole(newRole);
    }
  };

  const displayValue = effectiveRole || actualRole || "NONE";

  return (
    <Select
      label={t("viewAs")}
      size="small"
      value={displayValue}
      onChange={handleChange}
    >
      {roles.map((role) => (
        <option key={role.value} value={role.value}>
          {role.label}
        </option>
      ))}
    </Select>
  );
}

export function RoleContextSwitcher() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  return <RoleContextSwitcherInner />;
}
