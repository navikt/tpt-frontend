import { RepoWithGroupedChecks } from "@/app/modules/goldenpath/useCheckResults";

export default function GoldenPathStatus({name, bad}: RepoWithGroupedChecks) {
    return <div>
    <h3>{name}</h3>
    <ul>
    {bad.map(b => b.reasons?.map(r => <li key={r}>{r} ({b.severity})</li>))}
    </ul>
    {bad.length !== 0 && bad.map(b => <p key={b.name}>{b.desc}</p>)}
    </div>
}