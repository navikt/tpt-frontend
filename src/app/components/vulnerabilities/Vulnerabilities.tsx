"use client";
import { useVulnerabilities } from "../../hooks/useVulnerabilities";
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
    cveFilters,
    setCveFilters,
    allTeams,
    availableApplications,
    availableCves,
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
          </div>
          <VulnerabilitiesTable
            data={data}
            teamFilters={teamFilters}
            applicationFilters={applicationFilters}
            cveFilters={cveFilters}
          />
        </>
      ) : null}
    </>
  );
};

export default Vulnerabilities;
