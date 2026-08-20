"use client";

import { useState } from "react";
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

interface GitHubFilterModalProps {
  open: boolean;
  onClose: () => void;
  allTeams: string[];
  selectedTeams: string[];
  onTeamsChange: (teams: string[]) => void;
  allRepositories: string[];
  selectedRepositories: string[];
  onRepositoriesChange: (repos: string[]) => void;
}

export function GitHubFilterModal({
  open,
  onClose,
  allTeams,
  selectedTeams,
  onTeamsChange,
  allRepositories,
  selectedRepositories,
  onRepositoriesChange,
}: GitHubFilterModalProps) {
  const t = useTranslations("github.filterModal");

  // When selectedTeams/selectedRepositories is resolved to "all" upstream (empty filter = show all),
  // initialise temp state to all items so every checkbox appears checked.
  const [tempSelectedTeams, setTempSelectedTeams] = useState<string[]>(
    selectedTeams.length > 0 ? selectedTeams : Array.from(new Set(allTeams)).sort()
  );
  const [tempSelectedRepos, setTempSelectedRepos] = useState<string[]>(selectedRepositories);
  const [repoSearch, setRepoSearch] = useState("");

  const uniqueTeams = Array.from(new Set(allTeams)).sort();
  const uniqueRepos = Array.from(new Set(allRepositories)).sort();

  const filteredRepos = repoSearch.trim()
    ? uniqueRepos.filter((r) =>
        r.toLowerCase().includes(repoSearch.toLowerCase())
      )
    : uniqueRepos;

  const handleTeamToggle = (team: string) => {
    setTempSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    );
  };

  const handleRepoToggle = (repo: string) => {
    setTempSelectedRepos((prev) =>
      prev.includes(repo) ? prev.filter((r) => r !== repo) : [...prev, repo]
    );
  };

  const handleApply = () => {
    // If all teams/repos are checked, pass [] to signal "no filter = show all"
    const teamsToApply = tempSelectedTeams.length === uniqueTeams.length ? [] : tempSelectedTeams;
    const reposToApply = tempSelectedRepos.length === uniqueRepos.length ? [] : tempSelectedRepos;
    onTeamsChange(teamsToApply);
    onRepositoriesChange(reposToApply);
    onClose();
  };

  const handleReset = () => {
    onTeamsChange([]);
    onRepositoriesChange([]);
    onClose();
  };

  return (
    <Modal
      key={`github-filter-${open ? "open" : "closed"}`}
      open={open}
      onClose={onClose}
      closeOnBackdropClick
      header={{ heading: t("title"), closeButton: true }}
    >
      <Modal.Body>
        <VStack gap="space-24">
          {/* Teams */}
          <VStack gap="space-12">
            <div>
              <Label size="small">{t("teamsLabel")}</Label>
              <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
                {t("teamsDescription")}
              </BodyShort>
            </div>
            {uniqueTeams.length === 0 ? (
              <BodyShort size="small">{t("noTeams")}</BodyShort>
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

          {/* Repositories */}
          <VStack gap="space-12">
            <div>
              <Label size="small">{t("repositoriesLabel")}</Label>
              <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
                {t("repositoriesDescription")}
              </BodyShort>
            </div>
            <TextField
              label={t("repositoriesSearchPlaceholder")}
              hideLabel
              placeholder={t("repositoriesSearchPlaceholder")}
              value={repoSearch}
              onChange={(e) => setRepoSearch(e.target.value)}
              size="small"
              autoComplete="off"
            />
            {tempSelectedRepos.length > 0 && (
              <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
                {t("repositoriesSelected", { count: tempSelectedRepos.length })}
              </BodyShort>
            )}
            {uniqueRepos.length === 0 ? (
              <BodyShort size="small">{t("noRepositories")}</BodyShort>
            ) : (
              <div
                style={{
                  maxHeight: "16rem",
                  overflowY: "auto",
                  border: "1px solid var(--ax-border-neutral-subtle)",
                  borderRadius: "4px",
                  padding: "0.5rem",
                }}
              >
                <VStack gap="space-8">
                  {filteredRepos.map((repo) => (
                    <Checkbox
                      key={repo}
                      checked={tempSelectedRepos.includes(repo)}
                      onChange={() => handleRepoToggle(repo)}
                    >
                      {repo}
                    </Checkbox>
                  ))}
                  {filteredRepos.length === 0 && (
                    <BodyShort size="small">{t("noRepositories")}</BodyShort>
                  )}
                </VStack>
              </div>
            )}
          </VStack>
        </VStack>
      </Modal.Body>

      <Modal.Footer>
        <HStack gap="space-16" justify="space-between" style={{ width: "100%" }}>
          <Button variant="tertiary" onClick={handleReset}>
            {t("reset")}
          </Button>
          <HStack gap="space-8">
            <Button variant="secondary" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button onClick={handleApply}>{t("apply")}</Button>
          </HStack>
        </HStack>
      </Modal.Footer>
    </Modal>
  );
}
