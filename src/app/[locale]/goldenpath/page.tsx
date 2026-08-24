"use client";

import { useEffect, useState } from "react";

export default function GoldenPathPage() {
  const [checkResults, setCheckResults] = useState(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/datacollector/checks")
      .then((res) => res.json())
      .then((checks) => {
        setCheckResults(checks)
        setLoading(false)
      })
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!checkResults) return <p>Nothing to see here</p>

  return <section>
    <div id="check-results">{ Object.keys(checkResults).map(key => <div key={key}><h3 >{key}</h3><p>{ JSON.stringify(checkResults[key]) }</p></div> )} </div>
  </section>;
}
