"use client";
import { useVulnerabilities } from "./useVulnerabilities";
import VulnerabilitiesTable from "./table/VulnerabilitiesTable";
import FilterActionMenu from "./filteractionmenu/FilterActionMenu";

const Vulnerabilities = () => {
  const { data, isLoading, filters, setFilters } = useVulnerabilities();

  if (isLoading) {
    return <div>Loading vulnerabilities...</div>;
  }

  console.log("data", data);

  return (
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
          filterOptions={[
            "Frontend Team",
            "Backend Team",
            "Platform Team",
            "Data Team",
          ]}
          selectedFilters={filters}
          setFilter={setFilters}
        />
      </div>
      <VulnerabilitiesTable data={data} />
    </>
  );
};

export default Vulnerabilities;
