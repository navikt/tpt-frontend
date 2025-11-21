"use client";

import { useState } from "react";

export default function TestButton() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      console.log("Fetching applications from /api/applications");
      const response = await fetch("/api/applications");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchApplications} disabled={loading}>
        {loading ? "Loading..." : "Fetch Applications"}
      </button>
      {data && (
        <pre style={{ marginTop: "20px", textAlign: "left", fontSize: "12px" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
