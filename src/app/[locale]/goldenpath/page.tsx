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
    <div id="check-results">{format(checkResults)}</div>
  </section>;
}


const groupedChecks = (fetchResult: RepoChecks) =>
  Object.keys(fetchResult).map(repoName => {
    const repo: RepoWithGroupedChecks = {
      name: repoName,
      good: [],
      bad: []
    }
    const results = fetchResult[repoName]
    results?.forEach(result => {
      if (result.type == "AllGood") { repo.good.push(result) } else { repo.bad.push(result) }
    })
    return repo
  })

const format = (fetchResult: RepoChecks) => {
  const grouped = groupedChecks(fetchResult)
  return (<div>
    {grouped.map(g =>
      <details  key={g.name}>
        <summary>{g.name} ({g.bad.length})</summary>
        <ul>{g.bad.map(b => <li key="{b.name}">{b.desc}</li>)}</ul>
        <p>Nr of good checks: {g.bad.length}</p>
      </details>)
    }
  </div>)
}


type RepoName = string

type CheckResult =
  | {
    type: "AllGood";
    name: string;
    desc: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
    whenChecked: string;
  }
  | {
    type: "NeedsWork";
    name: string;
    desc: string;
    whenChecked: string;
    reasons: string[];
    severity?: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN"
  };

type RepoChecks = Record<RepoName, CheckResult[]>

type RepoWithGroupedChecks = {
  name: string,
  good: CheckResult[],
  bad: CheckResult[]
}
