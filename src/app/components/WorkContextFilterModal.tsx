"use client";

import { useMemo, useState } from "react";
import {
  Modal,
  Button,
  HStack,
  VStack,
  Checkbox,
  BodyShort,
  TextField,
  Label,
} from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";

interface WorkContextFilterModalProps {
  open: boolean;
  onClose: () => void;
  selectedTeams: string[];
  onTeamsChange: (teams: string[]) => void;
  selectedApplications: string[];
  onApplicationsChange: (applications: string[]) => void;
}

export default function WorkContextFilterModal({
  open,
  onClose,
  selectedTeams,
  onTeamsChange,
  selectedApplications,
  onApplicationsChange,
}: WorkContextFilterModalProps) {
  const t = useTranslations("workContextFilter");
  const { data } = useVulnerabilitiesContext();
  const allTeams = useMemo(
    () => Array.from(new Set(data?.teams.map((team) => team.team) ?? [])).sort(),
    [data]
  );
  const [tempSelectedTeams, setTempSelectedTeams] = useState<string[]>(
    selectedTeams.length > 0 ? selectedTeams : allTeams
  );
  const [tempSelectedApplications, setTempSelectedApplications] =
    useState<string[]>(selectedApplications);
  const [applicationSearch, setApplicationSearch] = useState("");

  const availableApplications = useMemo(() => {
    const selectedTeamSet = new Set(tempSelectedTeams);
    return Array.from(
      new Set(
        data?.teams
          .filter((team) => selectedTeamSet.has(team.team))
          .flatMap((team) => team.workloads.map((workload) => workload.name)) ?? []
      )
    ).sort();
  }, [data, tempSelectedTeams]);

  const filteredApplications = availableApplications.filter(
    (application) =>
      applicationSearch.trim() === "" ||
      application.toLowerCase().includes(applicationSearch.toLowerCase())
  );

  function toggleTeam(team: string) {
    setTempSelectedTeams((current) =>
      current.includes(team)
        ? current.filter((selectedTeam) => selectedTeam !== team)
        : [...current, team]
    );
  }

  function toggleApplication(application: string) {
    setTempSelectedApplications((current) =>
      current.includes(application)
        ? current.filter(
            (selectedApplication) => selectedApplication !== application
          )
        : [...current, application]
    );
  }

  function applyFilters() {
    const teamsToApply =
      tempSelectedTeams.length === allTeams.length ? [] : tempSelectedTeams;
    const availableApplicationSet = new Set(availableApplications);
    const applicationsToApply = tempSelectedApplications.filter((application) =>
      availableApplicationSet.has(application)
    );

    onTeamsChange(teamsToApply);
    onApplicationsChange(applicationsToApply);
    onClose();
  }

  function resetFilters() {
    onTeamsChange([]);
    onApplicationsChange([]);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnBackdropClick
      header={{ heading: t("title"), closeButton: true }}
    >
      <Modal.Body>
        <VStack gap="space-24">
          <VStack gap="space-12">
            <div>
              <Label size="small">{t("teamsLabel")}</Label>
              <BodyShort
                size="small"
                style={{ color: "var(--ax-text-neutral-subtle)" }}
              >
                {t("teamsDescription")}
              </BodyShort>
            </div>
            {allTeams.length > 0 ? (
              <VStack gap="space-8">
                {allTeams.map((team) => (
                  <Checkbox
                    key={team}
                    checked={tempSelectedTeams.includes(team)}
                    onChange={() => toggleTeam(team)}
                  >
                    {team}
                  </Checkbox>
                ))}
              </VStack>
            ) : (
              <BodyShort>{t("noTeams")}</BodyShort>
            )}
          </VStack>

          <VStack gap="space-12">
            <div>
              <Label size="small">{t("applicationsLabel")}</Label>
              <BodyShort
                size="small"
                style={{ color: "var(--ax-text-neutral-subtle)" }}
              >
                {t("applicationsDescription")}
              </BodyShort>
            </div>
            <TextField
              label={t("applicationsSearchLabel")}
              hideLabel
              placeholder={t("applicationsSearchPlaceholder")}
              value={applicationSearch}
              onChange={(event) => setApplicationSearch(event.target.value)}
              size="small"
            />
            {tempSelectedApplications.length > 0 && (
              <BodyShort
                size="small"
                style={{ color: "var(--ax-text-neutral-subtle)" }}
              >
                {t("applicationsSelected", {
                  count: tempSelectedApplications.length,
                })}
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
                  {filteredApplications.map((application) => (
                    <Checkbox
                      key={application}
                      checked={tempSelectedApplications.includes(application)}
                      onChange={() => toggleApplication(application)}
                    >
                      {application}
                    </Checkbox>
                  ))}
                </VStack>
              ) : (
                <BodyShort size="small">{t("noApplications")}</BodyShort>
              )}
            </div>
          </VStack>
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <HStack gap="space-16" justify="space-between" style={{ width: "100%" }}>
          <Button variant="tertiary" onClick={resetFilters}>
            {t("reset")}
          </Button>
          <HStack gap="space-16">
            <Button variant="secondary" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button onClick={applyFilters}>{t("apply")}</Button>
          </HStack>
        </HStack>
      </Modal.Footer>
    </Modal>
  );
}
