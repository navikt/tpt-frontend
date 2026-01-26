"use client";
import { useVulnerabilities } from "../../modules/vulnerabilities/hooks/useVulnerabilities";
import VulnerabilitiesTable from "./table/VulnerabilitiesTable";
import FilterActionMenu from "./filteractionmenu/FilterActionMenu";

const Vulnerabilities = () => {
  const {
    data,
    isLoading,
    teamFilters,
    setTeamFilters,
    applicationFilters,
    setApplicationFilters,
    environmentFilters,
    setEnvironmentFilters,
    cveFilters,
    setCveFilters,
    packageNameFilters,
    setPackageNameFilters,
    allTeams,
    availableEnvironments,
    availableApplications,
    availableCves,
    availablePackageNames,
  } = useVulnerabilities();

  if (isLoading) {
    return <div>Loading vulnerabilities...</div>;
  }

  return (
    <>
      {data ? (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginBottom: "8px",
              marginTop: "2rem",
            }}
          >
            <FilterActionMenu
              filterName="Team"
              filterOptions={allTeams}
              selectedFilters={teamFilters}
              setFilter={setTeamFilters}
            />
            <FilterActionMenu
              style={{ marginLeft: "1rem" }}
              filterName="Environment"
              filterOptions={availableEnvironments}
              selectedFilters={environmentFilters}
              setFilter={setEnvironmentFilters}
            />
            <FilterActionMenu
              style={{ marginLeft: "1rem" }}
              filterName="Application"
              filterOptions={availableApplications}
              selectedFilters={applicationFilters}
              setFilter={setApplicationFilters}
            />
            <FilterActionMenu
              style={{ marginLeft: "1rem" }}
              filterName="CVE"
              filterOptions={availableCves}
              selectedFilters={cveFilters}
              setFilter={setCveFilters}
            />
            <FilterActionMenu
              style={{ marginLeft: "1rem" }}
              filterName="Package"
              filterOptions={availablePackageNames}
              selectedFilters={packageNameFilters}
              setFilter={setPackageNameFilters}
            />
          </div>
          <VulnerabilitiesTable
            data={data}
            teamFilters={teamFilters}
            applicationFilters={applicationFilters}
            environmentFilters={environmentFilters}
            cveFilters={cveFilters}
            packageNameFilters={packageNameFilters}
          />
        </>
      ) : null}
    </>
  );
};

export default Vulnerabilities;
