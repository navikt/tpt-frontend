"use client"

import GoldenPathStatus from "@/app/components/goldenpath/GoldenPathStatusForRepo"
import { RepoWithGroupedChecks, useCheckResults } from "@/app/modules/goldenpath/useCheckResults"

export default function GoldenPathPage() {
  const {checkResults, isLoading} = useCheckResults()

  return <section>
    {isLoading && <div>Loading...</div>}
    <div id="check-results">{display(checkResults)}</div>
  </section>
}

const display = (checks: RepoWithGroupedChecks[]) => { 
  const reposWithIssues = checks.filter(c => c.bad.length !== 0)
  return (
    <div>
    <h2>Ting å ta tak i</h2>
    {reposWithIssues.map(g => <GoldenPathStatus{...g} key={g.name} /> )}
    </div>
  )
}

