"use client";
import { useVulnerabilities } from "./useVulnerabilities";
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
          </div>
          <VulnerabilitiesTable
            data={data}
            teamFilters={teamFilters}
            applicationFilters={applicationFilters}
          />
        </>
      ) : null}
    </>
  );
};

export default Vulnerabilities;
