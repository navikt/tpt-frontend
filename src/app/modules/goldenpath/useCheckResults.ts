import { useEffect, useState } from "react"

export const useCheckResults = () => {
    const [checkResults, setCheckResults] = useState<RepoWithGroupedChecks[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const load = () => {
        fetch("/api/datacollector/checks")
            .then((res) => res.json())
            .then((backendReply) => {
                setCheckResults(groupedChecks(backendReply))
                setIsLoading(false)
            }).catch((err) => {
                setIsLoading(false)
                console.error(err)
            })
    }

    const triggerCheckRun = () => {
        fetch("/api/datacollector/collect", { method: "POST" })
            .then((res) => console.log(`Triggered checks run: ${res.status}`))
            .catch((err) => {
                console.error(err)
            })
    }

    useEffect(() => {
        load()
        triggerCheckRun()
        const loadInterval = setInterval(load, 60 * 15 * 1000)
        const checkInterval = setInterval(load, 60 * 15 * 1000)
        return () => {
            clearTimeout(loadInterval)
            clearTimeout(checkInterval)
        }
    }, [])


    return {
        checkResults, isLoading
    }
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

export type RepoName = string

export type CheckResult = {
    type: "AllGood" | "NeedsWork";
    name: string;
    desc: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
    whenChecked: string;
    reasons?: string[];
}

export type RepoChecks = Record<RepoName, CheckResult[]>

export type RepoWithGroupedChecks = {
    name: string,
    good: CheckResult[],
    bad: CheckResult[]
}