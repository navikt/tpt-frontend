"use client";
import { useVulnerabilitiesContext } from "../../contexts/VulnerabilitiesContext";
import VulnerabilitiesTable from "./table/VulnerabilitiesTable";
import FilterActionMenu from "./filteractionmenu/FilterActionMenu";

const Vulnerabilities = () => {
  const {
    data,
    isLoading,
    teamFilters,
    applicationFilters,
    environmentFilters,
    setEnvironmentFilters,
    cveFilters,
    setCveFilters,
    packageNameFilters,
    setPackageNameFilters,
    availableEnvironments,
    availableCves,
    availablePackageNames,
  } = useVulnerabilitiesContext();

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
              filterName="environment"
              filterOptions={availableEnvironments}
              selectedFilters={environmentFilters}
              setFilter={setEnvironmentFilters}
            />
            <FilterActionMenu
              style={{ marginLeft: "1rem" }}
              filterName="cve"
              filterOptions={availableCves}
              selectedFilters={cveFilters}
              setFilter={setCveFilters}
            />
            <FilterActionMenu
              style={{ marginLeft: "1rem" }}
              filterName="package"
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
