"use client";
import { useState } from "react";
import { Tabs } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import Vulnerabilities from "./Vulnerabilities";
import GitHubVulnerabilitiesList from "../github/GitHubVulnerabilitiesList";
import GitHubVulnerabilitySummary, { BucketThreshold } from "../github/GitHubVulnerabilitySummary";
import VulnerabilitiesSummary from "../vulnerabilitiesToLookAt/VulnerabilitySummary";

const VulnerabilitiesTabs = () => {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("vulnerabilities");
  const [selectedBucket, setSelectedBucket] = useState<BucketThreshold>({
    name: t("buckets.highPriority"),
    minThreshold: 150,
    maxThreshold: Number.MAX_VALUE,
  });
  const [selectedGitHubBucket, setSelectedGitHubBucket] = useState<BucketThreshold>({
    name: t("buckets.highPriority"),
    minThreshold: 150,
    maxThreshold: Number.MAX_VALUE,
  });
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedGitHubTeams, setSelectedGitHubTeams] = useState<string[]>([]);

  return (
    <div>
      <Tabs value={activeTab} onChange={setActiveTab} defaultValue="vulnerabilities">
        <Tabs.List>
          <Tabs.Tab value="vulnerabilities" label={t("common.vulnerabilities")} />
          <Tabs.Tab value="github" label={t("github.tab")} />
        </Tabs.List>
        <Tabs.Panel value="vulnerabilities">
          <VulnerabilitiesSummary
            selectedBucket={selectedBucket}
            onBucketSelect={setSelectedBucket}
            selectedTeams={selectedTeams}
            onTeamsChange={setSelectedTeams}
          />
          <Vulnerabilities />
        </Tabs.Panel>
        <Tabs.Panel value="github">
          <GitHubVulnerabilitySummary
            selectedBucket={selectedGitHubBucket}
            onBucketSelect={setSelectedGitHubBucket}
            selectedTeams={selectedGitHubTeams}
            onTeamsChange={setSelectedGitHubTeams}
          />
          <GitHubVulnerabilitiesList
            selectedBucket={selectedGitHubBucket}
            selectedTeams={selectedGitHubTeams}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default VulnerabilitiesTabs;
