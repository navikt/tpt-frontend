---
applyTo: "messages/**,src/**/*.{tsx,ts}"
---

# Language & Domain Terminology

The UI is in Norwegian (Bokmål) by default, with English as a secondary locale. When writing user-facing text, always use `next-intl` translation keys — never hardcode strings.

## Key Domain Terms

| Norwegian (nb) | English (en) | Concept |
|---|---|---|
| Sårbarhet / Sårbarheter | Vulnerability / Vulnerabilities | Core domain object |
| Applikasjon / Applikasjoner | Application / Applications | Workload / deployment unit |
| Risikoscore | Risk score | Calculated priority score |

## Priority Bucket Labels

| Translation key | Norwegian (nb) | English (en) |
|---|---|---|
| `buckets.highPriority` | Snarest | Immediately |
| `buckets.important` | Må prioriteres | Must be prioritized |
| `buckets.whenTime` | Må planlegges | Must be scheduled |
| `buckets.lowPriority` | Når det passer seg | When convenient |

## Message Files

- `messages/nb.json` — Norwegian Bokmål (default locale)
- `messages/en.json` — English

Both files must stay in sync — when adding a new key to one, add it to the other.
