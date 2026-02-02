"use client";
import { useState } from "react";
import {
  Modal,
  Button,
  HStack,
  VStack,
  Checkbox,
  BodyShort,
} from "@navikt/ds-react";
import { useTranslations } from "next-intl";

interface GitHubTeamFilterModalProps {
  open: boolean;
  onClose: () => void;
  allTeams: string[];
  selectedTeams: string[];
  onTeamsChange: (teams: string[]) => void;
}

export function GitHubTeamFilterModal({
  open,
  onClose,
  allTeams,
  selectedTeams,
  onTeamsChange,
}: GitHubTeamFilterModalProps) {
  const t = useTranslations("github.teamFilterModal");
  const [tempSelectedTeams, setTempSelectedTeams] = useState<string[]>(selectedTeams);

  const uniqueTeams = Array.from(new Set(allTeams)).sort();

  const handleApply = () => {
    onTeamsChange(tempSelectedTeams);
    onClose();
  };

  const handleTeamToggle = (team: string) => {
    if (tempSelectedTeams.includes(team)) {
      setTempSelectedTeams(tempSelectedTeams.filter((t) => t !== team));
    } else {
      setTempSelectedTeams([...tempSelectedTeams, team]);
    }
  };

  const handleSelectAll = () => {
    setTempSelectedTeams(uniqueTeams);
  };

  const handleClearAll = () => {
    setTempSelectedTeams([]);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      header={{ heading: t("title") }}
      width="small"
    >
      <Modal.Body>
        <VStack gap="space-16">
          <HStack gap="space-8">
            <Button size="small" variant="secondary" onClick={handleSelectAll}>
              {t("selectAll")}
            </Button>
            <Button size="small" variant="secondary" onClick={handleClearAll}>
              {t("clearAll")}
            </Button>
          </HStack>

          {uniqueTeams.length === 0 ? (
            <BodyShort>{t("noTeams")}</BodyShort>
          ) : (
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
          )}
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <HStack gap="space-8">
          <Button onClick={handleApply}>{t("apply")}</Button>
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
        </HStack>
      </Modal.Footer>
    </Modal>
  );
}
