"use client";
import { useState } from "react";
import { Button } from "@navikt/ds-react";
import { FilterIcon } from "@navikt/aksel-icons";
import TeamFilterModal from "@/app/modules/vulnerabilities/components/TeamFilterModal";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import { useTranslations } from "next-intl";

interface FilterButtonProps {
  showAllBuckets?: boolean;
  onShowAllBucketsChange?: (show: boolean) => void;
}

/**
 * A self-contained filter button that opens TeamFilterModal.
 * Reads and writes teamFilters and applicationFilters directly from/to context,
 * which syncs them to the URL automatically.
 */
export default function FilterButton({
  showAllBuckets,
  onShowAllBucketsChange,
}: FilterButtonProps) {
  const t = useTranslations("teamFilter");
  const {
    data: vulnData,
    teamFilters,
    setTeamFilters,
    applicationFilters,
    setApplicationFilters,
  } = useVulnerabilitiesContext();

  const [open, setOpen] = useState(false);

  const selectedTeams = Object.keys(teamFilters).filter((k) => teamFilters[k] === true);
  const selectedApplications = Object.keys(applicationFilters).filter((k) => applicationFilters[k] === true);

  const handleTeamsChange = (teams: string[]) => {
    setTeamFilters(Object.fromEntries(teams.map((t) => [t, true])));
  };

  const handleApplicationsChange = (apps: string[]) => {
    setApplicationFilters(Object.fromEntries(apps.map((a) => [a, true])));
  };

  const activeFilterCount =
    (selectedTeams.length > 0 ? 1 : 0) + (selectedApplications.length > 0 ? 1 : 0);

  const allTeamCount = vulnData?.teams.length ?? 0;
  const isFiltered =
    (selectedTeams.length > 0 && selectedTeams.length < allTeamCount) ||
    selectedApplications.length > 0;

  return (
    <>
      <Button
        variant={isFiltered ? "primary" : "tertiary"}
        size="small"
        icon={<FilterIcon aria-hidden />}
        onClick={() => setOpen(true)}
      >
        {t("buttonLabel")}
        {activeFilterCount > 0 && ` (${activeFilterCount})`}
      </Button>

      <TeamFilterModal
        open={open}
        onClose={() => setOpen(false)}
        selectedTeams={selectedTeams}
        onTeamsChange={handleTeamsChange}
        selectedApplications={selectedApplications}
        onApplicationsChange={handleApplicationsChange}
        showAllBuckets={showAllBuckets}
        onShowAllBucketsChange={onShowAllBucketsChange}
      />
    </>
  );
}
