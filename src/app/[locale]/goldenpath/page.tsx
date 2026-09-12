"use client"

import { RepoWithGroupedChecks, useCheckResults } from "@/app/modules/goldenpath/useCheckResults"
import { Accordion, Heading, VStack } from "@navikt/ds-react";
import { useTranslations } from "next-intl";

export default function GoldenPathPage() {
  const { checkResults, isLoading } = useCheckResults()
  const t = useTranslations("goldenpath");

  return <main style={{ marginTop: "2rem" }}>
    {isLoading && <div>Loading...</div>}
    <Heading size="large" level="2" spacing>
      {t("title")}
    </Heading>

    <div id="check-results">{display(checkResults)}</div>
  </main>
}

const display = (checks: RepoWithGroupedChecks[]) => {

  const reposWithIssues = checks.filter(c => c.bad.length !== 0)
  const totalNrOfGoodChecks = checks.map(c => c.good.length).reduce((acc, current) => acc + current, 0)
  const totalNrOfBadChecks = checks.map(c => c.bad.length).reduce((acc, current) => acc + current, 0)
  return (
    <div>
      <p>✅ {totalNrOfGoodChecks} ❌ {totalNrOfBadChecks}</p>
      <VStack>
        <Accordion>
          {reposWithIssues.map(repo => 
            <Accordion.Item key={repo.name}>
              <Accordion.Header>{`${repo.name} (${repo.bad.length})`}</Accordion.Header> 
              <Accordion.Content>
                <ul>
                  {repo.bad.flatMap((check) => <li>{check.reasons}</li>)}
                </ul>
                {repo.bad.flatMap((check) => <p>{check.desc}</p>)}
              </Accordion.Content>
            </Accordion.Item>  
          )}
        </Accordion>
      </VStack>
    </div>
  )
}

