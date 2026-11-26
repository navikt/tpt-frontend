import { useCallback, useEffect, useState } from "react"

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

    const suppressCheck = useCallback(async (repoName: string, checkName: string) => {
        const path = [...repoName.split("/"), checkName].map(encodeURIComponent).join("/")
        const res = await fetch(`/api/datacollector/checks/${path}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ suppress: true }),
        })
        if (!res.ok) throw new Error(`Failed to suppress check: ${res.status}`)
        setCheckResults((current) => current.map((repo) => repo.name !== repoName ? repo : {
            ...repo,
            good: repo.good.filter((check) => check.name !== checkName),
            bad: repo.bad.filter((check) => check.name !== checkName),
        }))
    }, [])

    return {
        checkResults, isLoading, hasError, suppressCheck
    }
}


const groupedChecks = (backendReply: RepoChecks): RepoWithGroupedChecks[] =>
    backendReply.map(({ repoName, repoOwners, results }) => {
        const repo: RepoWithGroupedChecks = {
            name: repoName,
            owners: repoOwners ?? [],
            good: [],
            bad: []
        }
        results?.forEach(result => {
            if (result.suppressed) return
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
    suppressed?: boolean;
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