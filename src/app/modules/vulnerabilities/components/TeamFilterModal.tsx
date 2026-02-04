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
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import { useTranslations } from "next-intl";

interface TeamFilterModalProps {
  open: boolean;
  onClose: () => void;
  selectedTeams: string[];
  onTeamsChange: (teams: string[]) => void;
  showAllBuckets?: boolean;
  onShowAllBucketsChange?: (show: boolean) => void;
}

const TeamFilterModal = ({
  open,
  onClose,
  selectedTeams,
  onTeamsChange,
  showAllBuckets = false,
  onShowAllBucketsChange,
}: TeamFilterModalProps) => {
  const t = useTranslations("teamFilter");
  const { data, isLoading } = useVulnerabilitiesContext();
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
          <VStack gap="space-24">
            <div>
              <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
                {t("description")}
              </BodyShort>
            </div>

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

            {uniqueTeams.length > 0 && (
              <div>
                <VStack gap="space-12">
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
        <HStack gap="space-16">
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
