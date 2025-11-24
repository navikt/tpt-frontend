"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { VulnerabilitiesResponse } from "./types/vulnerabilities";

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [applicationsData, setApplicationsData] =
    useState<VulnerabilitiesResponse | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/applications");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setApplicationsData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching applications data:", error);
      }
    }

    fetchApplications();
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>TPT er kult</h1>
          {isLoading ? <p>laster inn data..</p> : null}
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
