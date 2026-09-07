"use client"

import { RepoWithGroupedChecks, useCheckResults } from "@/app/modules/goldenpath/useCheckResults"

export default function GoldenPathPage() {
  const {checkResults, isLoading} = useCheckResults()

  return <section>
    {isLoading && <div>Loading...</div>}
    <div id="check-results">{display(checkResults)}</div>
  </section>
}

const display = (checks: RepoWithGroupedChecks[]) => { 
  const allGoodRepos = checks.filter(c => c.bad.length === 0)
  const reposWithIssues = checks.filter(c => c.bad.length !== 0)
  return <div>
    <h2>Repos with issues</h2>
    {reposWithIssues.map(g =>
      <details key={g.name}>
        <summary>{g.name} ({g.bad.length})</summary>
        <ul>{g.bad.map(b => <li key={b.name}>{b.name} - {b.severity} - {b.reasons?.join()}</li>)}</ul>
        <p>Nr of good checks: {g.good.length}</p>
      </details>)
    }
    <h2>Repos with no issues</h2>
    <p>{allGoodRepos.map(r => r.name).join()}</p>
  </div>
}

