"use client";
import { useState } from "react";
import {
  Modal,
  Button,
  HStack,
  VStack,
  Checkbox,
  BodyShort,
  Loader,
  TextField,
  Label,
} from "@navikt/ds-react";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import { useTranslations } from "next-intl";

interface TeamFilterModalProps {
  open: boolean;
  onClose: () => void;
  selectedTeams: string[];
  onTeamsChange: (teams: string[]) => void;
  selectedApplications?: string[];
  onApplicationsChange?: (apps: string[]) => void;
  showAllBuckets?: boolean;
  onShowAllBucketsChange?: (show: boolean) => void;
}

const TeamFilterModal = ({
  open,
  onClose,
  selectedTeams,
  onTeamsChange,
  selectedApplications = [],
  onApplicationsChange,
  showAllBuckets = false,
  onShowAllBucketsChange,
}: TeamFilterModalProps) => {
  const t = useTranslations("teamFilter");
  const { data, isLoading, availableApplications } = useVulnerabilitiesContext();
  const [tempSelectedTeams, setTempSelectedTeams] = useState<string[]>(selectedTeams);
  const [tempSelectedApplications, setTempSelectedApplications] = useState<string[]>(selectedApplications);
  const [appSearch, setAppSearch] = useState<string>("");

  // Get unique teams from data
  const allTeams = data?.teams.map((team) => team.team) || [];
  const uniqueTeams = Array.from(new Set(allTeams)).sort();

  const filteredApplications = availableApplications
    .slice()
    .sort()
    .filter((app) =>
      appSearch.trim() === "" || app.toLowerCase().includes(appSearch.toLowerCase())
    );

  const handleTeamToggle = (team: string) => {
    if (tempSelectedTeams.includes(team)) {
      setTempSelectedTeams(tempSelectedTeams.filter((t) => t !== team));
    } else {
      setTempSelectedTeams([...tempSelectedTeams, team]);
    }
  };

  const handleAppToggle = (app: string) => {
    if (tempSelectedApplications.includes(app)) {
      setTempSelectedApplications(tempSelectedApplications.filter((a) => a !== app));
    } else {
      setTempSelectedApplications([...tempSelectedApplications, app]);
    }
  };

  const handleApply = () => {
    onTeamsChange(tempSelectedTeams);
    onApplicationsChange?.(tempSelectedApplications);
    onClose();
  };

  const handleReset = () => {
    onTeamsChange([]);
    onApplicationsChange?.([]);
    onClose();
  };

  return (
    <Modal
      key={`team-filter-${open ? "open" : "closed"}-${selectedTeams.join("|")}-${selectedApplications.join("|")}`}
      open={open}
      onClose={onClose}
      header={{
        heading: t("title"),
        closeButton: true,
      }}
    >
      <Modal.Body>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <Loader size="medium" title={t("loadingTeams")} />
          </div>
        ) : (
          <VStack gap="space-24">
            {/* Team filter */}
            <VStack gap="space-12">
              <div>
                <Label size="small">{t("teamsLabel")}</Label>
                <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
                  {t("description")}
                </BodyShort>
              </div>
              {uniqueTeams.length > 0 ? (
                <VStack gap="space-8">
                  {uniqueTeams.map((team) => (
                    <Checkbox
                      key={team}
                      checked={tempSelectedTeams.includes(team)}
                      onChange={() => handleTeamToggle(team)}
                    >
                      {team}
                    </Checkbox>
                  ))}
                </VStack>
              ) : (
                <BodyShort>{t("noTeams")}</BodyShort>
              )}
            </VStack>

            {/* Application filter — only shown when caller supports it */}
            {onApplicationsChange && (
              <VStack gap="space-12">
                <div>
                  <Label size="small">{t("appsLabel")}</Label>
                  <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
                    {t("appsDescription")}
                  </BodyShort>
                </div>
                <TextField
                  label={t("appsSearchLabel")}
                  hideLabel
                  placeholder={t("appsSearchPlaceholder")}
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  size="small"
                />
                {tempSelectedApplications.length > 0 && (
                  <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
                    {t("appsSelected", { count: tempSelectedApplications.length })}
                  </BodyShort>
                )}
                <div
                  style={{
                    maxHeight: "16rem",
                    overflowY: "auto",
                    border: "1px solid var(--ax-border-neutral-subtle)",
                    borderRadius: "4px",
                    padding: "0.5rem",
                  }}
                >
                  {filteredApplications.length > 0 ? (
                    <VStack gap="space-8">
                      {filteredApplications.map((app) => (
                        <Checkbox
                          key={app}
                          checked={tempSelectedApplications.includes(app)}
                          onChange={() => handleAppToggle(app)}
                        >
                          {app}
                        </Checkbox>
                      ))}
                    </VStack>
                  ) : (
                    <BodyShort size="small">{t("noApps")}</BodyShort>
                  )}
                </div>
              </VStack>
            )}

            {/* Show all buckets toggle */}
            {onShowAllBucketsChange && (
              <div>
                <Checkbox
                  checked={showAllBuckets}
                  onChange={(e) => onShowAllBucketsChange(e.target.checked)}
                >
                  {t("showAllBuckets")}
                </Checkbox>
                <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)", marginTop: "0.5rem" }}>
                  {t("showAllBucketsDescription")}
                </BodyShort>
              </div>
            )}
          </VStack>
        )}
      </Modal.Body>
      <Modal.Footer>
        <HStack gap="space-16" justify="space-between" style={{ width: "100%" }}>
          <Button variant="tertiary" onClick={handleReset}>
            {t("reset")}
          </Button>
          <HStack gap="space-16">
            <Button variant="secondary" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button onClick={handleApply}>
              {t("apply")}
            </Button>
          </HStack>
        </HStack>
      </Modal.Footer>
    </Modal>
  );
};

export default TeamFilterModal;
