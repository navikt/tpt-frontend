"use client";

import { useState } from "react";
import { Button } from "@navikt/ds-react";
import { FilterIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import WorkContextFilterModal from "./WorkContextFilterModal";
import styles from "./WorkContextFilter.module.css";

export default function WorkContextFilter() {
  const t = useTranslations("workContextFilter");
  const {
    data,
    isLoading,
    teamFilters,
    setTeamFilters,
    applicationFilters,
    setApplicationFilters,
  } = useVulnerabilitiesContext();
  const [open, setOpen] = useState(false);

  const selectedTeams = Object.keys(teamFilters).filter(
    (team) => teamFilters[team] === true
  );
  const selectedApplications = Object.keys(applicationFilters).filter(
    (application) => applicationFilters[application] === true
  );
  const activeFilterCount =
    (selectedTeams.length > 0 ? 1 : 0) +
    (selectedApplications.length > 0 ? 1 : 0);

  return (
    <>
      <Button
        variant={activeFilterCount > 0 ? "primary" : "tertiary"}
        size="small"
        icon={<FilterIcon aria-hidden />}
        onClick={() => setOpen(true)}
        disabled={isLoading || !data}
        aria-label={
          activeFilterCount > 0
            ? t("buttonLabelWithCount", { count: activeFilterCount })
            : t("buttonLabel")
        }
      >
        <span className={styles.label}>
          {t("buttonLabel")}
          {activeFilterCount > 0 && ` (${activeFilterCount})`}
        </span>
      </Button>

      {open && (
        <WorkContextFilterModal
          open
          onClose={() => setOpen(false)}
          selectedTeams={selectedTeams}
          onTeamsChange={(teams) =>
            setTeamFilters(Object.fromEntries(teams.map((team) => [team, true])))
          }
          selectedApplications={selectedApplications}
          onApplicationsChange={(applications) =>
            setApplicationFilters(
              Object.fromEntries(
                applications.map((application) => [application, true])
              )
            )
          }
        />
      )}
    </>
  );
}
