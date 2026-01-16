"use client";
import { useState, useEffect } from "react";
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
        heading: "Filter etter team",
        closeButton: true,
      }}
    >
      <Modal.Body>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <Loader size="medium" title="Laster team..." />
          </div>
        ) : (
          <VStack gap="6">
            <div>
              <BodyShort size="small" style={{ color: "var(--a-text-subtle)" }}>
                Velg hvilke team du vil se sårbarheter for. Bare valgte team vil vises på hovedsiden.
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
              <BodyShort>Ingen team funnet</BodyShort>
            )}
          </VStack>
        )}
      </Modal.Body>

      <Modal.Footer>
        <HStack gap="4">
          <Button variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={handleApply}>
            Bruk filter
          </Button>
        </HStack>
      </Modal.Footer>
    </Modal>
  );
};

export default TeamFilterModal;
