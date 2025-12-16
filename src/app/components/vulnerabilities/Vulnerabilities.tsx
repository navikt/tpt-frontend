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
              filterOptions={Object.keys(teamFilters)}
              selectedFilters={teamFilters}
              setFilter={setTeamFilters}
            />
            <FilterActionMenu
              style={{ marginLeft: "1rem" }}
              filterName="Application"
              filterOptions={Object.keys(applicationFilters)}
              selectedFilters={applicationFilters}
              setFilter={setApplicationFilters}
            />
            <FilterActionMenu
              style={{ marginLeft: "1rem" }}
              filterName="CVE"
              filterOptions={Object.keys(cveFilters)}
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
