import { useEffect, useState } from "react"

export const useCheckResults = () => {
    const [checkResults, setCheckResults] = useState<RepoWithGroupedChecks[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [hasError, setHasError] = useState<boolean>(false)

    useEffect(() => {
        fetch("/api/datacollector/checks")
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to load check results: ${res.status}`)
                return res.json()
            })
            .then((backendReply) => {
                setCheckResults(groupedChecks(backendReply))
                setIsLoading(false)
            }).catch((err) => {
                setHasError(true)
                setIsLoading(false)
                console.error(err)
            })
        fetch("/api/datacollector/collect", { method: "POST" })
            .then((res) => console.log(`Triggered checks run: ${res.status}`))
            .catch((err) => {
                console.error(err)
            })
    }, [])

    return {
        checkResults, isLoading, hasError
    }
}


const GITHUB_ORG = "navikt"

/** Ensures the repository name includes the GitHub owner — "my-repo" → "navikt/my-repo" */
export const withGitHubOwner = (repoName: string): string =>
    repoName.includes("/") ? repoName : `${GITHUB_ORG}/${repoName}`

const groupedChecks = (backendReply: RepoChecks): RepoWithGroupedChecks[] =>
    backendReply.map(({ repoName, repoOwners, results }) => {
        const repo: RepoWithGroupedChecks = {
            name: withGitHubOwner(repoName),
            owners: repoOwners ?? [],
            good: [],
            bad: []
        }
        results?.forEach(result => {
            if (result.type === "NeedsWork") { repo.bad.push(result) } else { repo.good.push(result) }
        })
        return repo
    })

export type CheckResult = {
    type: "AllGood" | "NeedsWork";
    name: string;
    desc: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
    whenChecked: string;
    reasons?: string[];
}

export type RepoCheckResults = {
    repoName: string,
    repoOwners: string[],
    results: CheckResult[]
}

export type RepoChecks = RepoCheckResults[]

export type RepoWithGroupedChecks = {
    name: string,
    owners: string[],
    good: CheckResult[],
    bad: CheckResult[]
}