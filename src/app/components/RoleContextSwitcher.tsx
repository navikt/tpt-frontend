"use client";

import { Select } from "@navikt/ds-react";
import { useRoleContext } from "../shared/hooks/useRoleContext";
import { useTranslations } from "next-intl";

export function RoleContextSwitcher() {
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
    // If the new role matches the actual role, clear the override
    if (newRole === actualRole) {
      setSelectedRole(null);
    } else {
      setSelectedRole(newRole);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingRight: "1.5rem" }}>
      <Select
        label={t("viewAs")}
        hideLabel
        size="small"
        value={effectiveRole || "NONE"}
        onChange={handleChange}
        style={{ minWidth: "150px" }}
      >
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
