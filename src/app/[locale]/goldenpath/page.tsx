"use client"

import { useCheckResults } from "@/app/modules/goldenpath/useCheckResults"
import { Accordion, Box, Heading, HStack, VStack } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function GoldenPathPage() {
  const { checkResults, isLoading } = useCheckResults()
  const [ whatToView, setWhatToView ] = useState("bad")
  const t = useTranslations("goldenpath");

  const totalNrOfGoodChecks = checkResults.map(c => c.good.length).reduce((acc, current) => acc + current, 0)
  const totalNrOfBadChecks = checkResults.map(c => c.bad.length).reduce((acc, current) => acc + current, 0)

  return <main style={{ marginTop: "2rem" }}>
    {isLoading && <div>Loading...</div>}
    <Heading size="large" level="2" spacing>
      {t("title")}
    </Heading>

    <HStack gap="space-16" wrap>
      <Box
        key="bad"
        padding="space-20"
        borderRadius="4"
        onClick={() => setWhatToView("bad")}
        style={{
          backgroundColor: "var(--ax-bg-danger-strong)",
          border: whatToView === "bad" ? `3px solid var(--ax-bg-danger-strong)` : "3px solid transparent",
          flex: "1 1 0",
          minWidth: "140px",
          cursor: "pointer",
          transition: "border-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease",
          opacity: whatToView === "bad" ? 1 : 0.75,
          transform: whatToView === "bad" ? "scale(1)" : "scale(0.95)",
        }}
      >
        {totalNrOfBadChecks} {t("bad")} ❌
      </Box>
      <Box
        key="good"
        padding="space-20"
        borderRadius="4"
        onClick={() => setWhatToView("good")}
        style={{
          backgroundColor: "var(--ax-bg-success-strong)",
          border: whatToView === "bad" ? `3px solid var(--ax-bg-success-strong)` : "3px solid transparent",
          flex: "1 1 0",
          minWidth: "140px",
          cursor: "pointer",
          transition: "border-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease",
          opacity: whatToView === "good" ? 1 : 0.75,
          transform: whatToView === "good" ? "scale(1)" : "scale(0.95)",
        }}
      >
        {totalNrOfGoodChecks} {t("good")} ✅
      </Box>
    </HStack>
    <VStack>
      { checkResults.map(repo =>
      <Accordion key = "acc">
        <Accordion.Item key={repo.name}>
          <Accordion.Header>{`${repo.name} (${whatToView === "good" ? repo.good.length : repo.bad.length})`}</Accordion.Header>
          <Accordion.Content>
            {whatToView === "bad" && <ul>
              {repo.bad.flatMap((check) => <li>{check.reasons}</li>)}
            </ul>}
            {(whatToView === "good" ? repo.good : repo.bad).flatMap((check) => <p>{check.desc}</p>)}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )}
    </VStack>
  </main>
}


