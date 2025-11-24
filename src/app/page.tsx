"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [applicationsData, setApplicationsData] = useState<any>(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch("/api/applications");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setApplicationsData(data);
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
