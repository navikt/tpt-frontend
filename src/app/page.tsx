import styles from "./page.module.css";

async function fetchApplicationsData() {
  try {
    const response = await fetch("http://tpt-frontend/api/applications", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Server-side error fetching applications:", error);
    return null;
  }
}

export default async function Home() {
  const applicationsData = await fetchApplicationsData();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>TPT er kult</h1>
          {applicationsData && (
            <pre
              style={{ marginTop: "20px", textAlign: "left", fontSize: "12px" }}
            >
              {JSON.stringify(applicationsData, null, 2)}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}
