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
} from "@navikt/ds-react";
import { useVulnerabilities } from "../../hooks/useVulnerabilities";
import { useTranslations } from "next-intl";

interface TeamFilterModalProps {
  open: boolean;
  onClose: () => void;
  selectedTeams: string[];
  onTeamsChange: (teams: string[]) => void;
}

const TeamFilterModal = ({
  open,
  onClose,
  selectedTeams,
  onTeamsChange,
}: TeamFilterModalProps) => {
  const t = useTranslations("teamFilter");
  const { data, isLoading } = useVulnerabilities();
  const [tempSelectedTeams, setTempSelectedTeams] = useState<string[]>(selectedTeams);

  // Get unique teams from data
  const allTeams = data?.teams.map((team) => team.team) || [];
  const uniqueTeams = Array.from(new Set(allTeams)).sort();

  // Reinitialize temporary state when modal opens or selection changes by remounting via key

  const handleTeamToggle = (team: string) => {
    if (tempSelectedTeams.includes(team)) {
      setTempSelectedTeams(tempSelectedTeams.filter((t) => t !== team));
    } else {
      setTempSelectedTeams([...tempSelectedTeams, team]);
    }
  };

  // Removed select-all toggle; using only checkboxes per requirements

  const handleApply = () => {
    onTeamsChange(tempSelectedTeams);
    onClose();
  };

  return (
    <Modal
      key={`team-filter-${open ? 'open' : 'closed'}-${selectedTeams.join('|')}`}
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
          <VStack gap="6">
            <div>
              <BodyShort size="small" style={{ color: "var(--a-text-subtle)" }}>
                {t("description")}
              </BodyShort>
            </div>

            {uniqueTeams.length > 0 && (
              <div>
                <VStack gap="3">
                  {uniqueTeams.map((team) => {
                    const isChecked = tempSelectedTeams.includes(team);
                    
                    return (
                      <Checkbox
                        key={team}
                        checked={isChecked}
                        onChange={() => handleTeamToggle(team)}
                      >
                        {team}
                      </Checkbox>
                    );
                  })}
                </VStack>
              </div>
            )}

            {uniqueTeams.length === 0 && (
              <BodyShort>{t("noTeams")}</BodyShort>
            )}
          </VStack>
        )}
      </Modal.Body>

      <Modal.Footer>
        <HStack gap="4">
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleApply}>
            {t("apply")}
          </Button>
        </HStack>
      </Modal.Footer>
    </Modal>
  );
};

export default TeamFilterModal;
