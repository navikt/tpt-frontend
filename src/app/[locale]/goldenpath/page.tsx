"use client"

import { useCheckResults } from "@/app/modules/goldenpath/useCheckResults"
import { Accordion, Box, Heading, HStack, VStack } from "@navikt/ds-react";
import { useTranslations } from "next-intl";

export default function GoldenPathPage() {
  const { checkResults, isLoading } = useCheckResults()
  const t = useTranslations("goldenpath");

  const totalNrOfGoodChecks = checkResults.map(c => c.good.length).reduce((acc, current) => acc + current, 0)
  const totalNrOfBadChecks = checkResults.map(c => c.bad.length).reduce((acc, current) => acc + current, 0)
  const nrOfReposWithGoodChecks = checkResults.filter(c => c.good.length !== 0).length
  const nrOfReposWithBadChecks = checkResults.filter(c => c.bad.length !== 0).length

  return <main style={{ marginTop: "2rem" }}>
    {isLoading && <div>Loading...</div>}

    <HStack gap="space-16" wrap>
      <Box
        key="bad"
        padding="space-20"
        borderRadius="4"
        style={{
          backgroundColor: "var(--ax-bg-danger-strong)",
          flex: "1 1 0",
          minWidth: "140px",
        }}
      >
        {totalNrOfBadChecks} { t("bad") } {nrOfReposWithBadChecks} { t("repos") } 👀
      </Box>
      <Box
        key="good"
        padding="space-20"
        borderRadius="4"
        style={{
          backgroundColor: "var(--ax-bg-success-strong)",
          flex: "1 1 0",
          minWidth: "140px",
        }}
      >
        {totalNrOfGoodChecks} { t("good") } {nrOfReposWithGoodChecks} repo ✅
      </Box>
    </HStack>

    {nrOfReposWithBadChecks !== 0 &&
      <div>
        <Heading
          size="medium"
          level="2"
          style={{
            marginTop: "1rem",
            marginBottom: "1rem"
          }}>Ting som bør tittes på</Heading>
        <VStack>
          {checkResults.filter(repo => repo.bad.length !== 0).map(repo =>
            <Accordion key="acc">
              <Accordion.Item key={repo.name}>
                <Accordion.Header>{`${repo.name} (${repo.bad.length})`}</Accordion.Header>
                <Accordion.Content>
                  <ul>
                    {repo.bad.flatMap((check) => <li>({check.severity}) - {check.reasons}</li>)}
                  </ul>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion>
          )}
        </VStack>
      </div>
    }

    {nrOfReposWithBadChecks === 0 &&
      <Heading
        size="medium"
        level="2"
        style={{
          marginTop: "1rem",
          marginBottom: "1rem"
        }}>{t("nothingtosee")} ✌️</Heading>
    }

  </main>
}


