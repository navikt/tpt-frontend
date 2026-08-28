"use client";

import { useEffect, useState } from "react";

export default function GoldenPathPage() {
  const empty: RepoWithGroupedChecks[] = []
  const [checkResults, setCheckResults] = useState(empty)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/datacollector/checks")
      .then((res) => res.json())
      .then((backendReply) => {
        setCheckResults(groupedChecks(backendReply))
        setLoading(false)
      })
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!checkResults) return <p>Nothing to see here</p>

  return <section>
    <div id="check-results">{display(checkResults)}</div>
  </section>;
}

const groupedChecks = (backendReply: RepoChecks) => {
  return Object.keys(backendReply).map(repoName => {
    const repo: RepoWithGroupedChecks = {
      name: repoName,
      good: [],
      bad: []
    }
    const results = backendReply[repoName]
    results?.forEach(result => {
      if ('reasons' in result) { repo.bad.push(result) } else { repo.good.push(result) }
    })
    return repo
  })
}

const display = (checks: RepoWithGroupedChecks[]) => { 
  const allGoodRepos = checks.filter(c => c.bad.length === 0)
  const reposWithIssues = checks.filter(c => c.bad.length !== 0)
  return <div>
    <h2>Repos with issues</h2>
    {reposWithIssues.map(g =>
      <details key={g.name}>
        <summary>{g.name} ({g.bad.length})</summary>
        <ul>{g.bad.map(b => <li key={b.name}>{b.severity} - {b.reasons?.join()}</li>)}</ul>
        <p>Nr of good checks: {g.bad.length}</p>
      </details>)
    }
    <h2>Repos with no issues</h2>
    <p>{allGoodRepos.map(r => r.name).join()}</p>
  </div>
}


type RepoName = string

type CheckResult = {
  type: "AllGood" | "NeedsWork";
  name: string;
  desc: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  whenChecked: string;
  reasons?: string[];
}

type RepoChecks = Record<RepoName, CheckResult[]>

type RepoWithGroupedChecks = {
  name: string,
  good: CheckResult[],
  bad: CheckResult[]
}
