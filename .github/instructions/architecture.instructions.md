---
applyTo: "src/**/*.{ts,tsx}"
---

# Architecture & Domain

## Tech Stack

> ⚠️ **Read `node_modules/next/dist/docs/` before writing Next.js code.** This project uses Next.js 16 — APIs and conventions may differ significantly from training data. Heed deprecation notices.

- **Framework**: Next.js 16 (App Router, Turbopack, React Compiler enabled)
- **Language**: TypeScript
- **Design System**: NAV Aksel (`@navikt/ds-react`, `@navikt/aksel-icons`)
- **i18n**: `next-intl` with locales `nb` (default) and `en`. Messages in `messages/nb.json` and `messages/en.json`.
- **Data Source**: Vulnerability data from Nais and GitHub via `tpt-backend`. Frontend proxies all backend calls through `/api/*` route handlers.
- **Auth**: Nais OAuth with On-Behalf-Of (OBO) flow via `@navikt/oasis`. User info extracted from JWT `preferred_username` claim.
- **Observability**: Grafana Faro Web SDK (`src/instrumentation/faro.ts`) — see `observability.instructions.md`

## Modular Structure

Feature modules support independent development (GitHub, Vulnerabilities, Admin, and future modules) while sharing
common infrastructure.

```
src/app/
├── shared/                          # Shared infrastructure used by all modules
│   ├── types/                       # Common type definitions (Vulnerability, Workload, Team, etc.)
│   ├── utils/                       # Shared utility functions (risk scoring, severity colors)
│   ├── hooks/                       # Shared React hooks (useConfig, useUser)
│   ├── components/                  # Reusable UI components (risk tags, filters)
│   └── navigation.ts                # Module nav registry, role-gated via `allowedRoles`
│
├── modules/                         # Feature modules — each owns its components, hooks, and business logic
│   ├── vulnerabilities/             # Main vulnerability prioritization features (components/, hooks/)
│   ├── github/                      # GitHub repository vulnerability scanning (components/, hooks/)
│   └── admin/                       # GCVE comparison, team overview/SLA, vulnrichment backfill (components/, hooks/)
│
├── [locale]/                        # Next.js routes (locale-aware): page.tsx, layout.tsx, prioritization/,
│                                     # compliance/, vulnerabilities/, github/, admin/
│
├── components/                      # Cross-cutting app-level components (not module-specific):
│                                     # LanguageSwitcher.tsx, RoleContextSwitcher.tsx, FaroInitializer.tsx, etc.
│
└── api/                             # Backend proxy endpoints: applications/, github/, config/, admin/,
                                      # sla/overdue/, events/, datacollector/
```

To add a new module:
1. Create `src/app/modules/[name]/` with `components/` and `hooks/`
2. Add API endpoint `/api/[name]` (proxy to backend)
3. Create route `[locale]/[name]/page.tsx`
4. Add an entry to `shared/navigation.ts` (set `allowedRoles` if the module should be role-gated)
5. Add translation keys `[name].*` to `messages/*.json`

Both `vulnerabilities` and `github` modules share: data types (`Vulnerability`, `Team`, `Workload`), the bucket
system, risk scoring (`getRiskFactors()`), Aksel UI patterns, and i18n keys under `common.*`/`buckets.*`/`riskFactors.*`.

### Role-Based Navigation

Navigation entries in `shared/navigation.ts` carry an optional `allowedRoles` field (`DEVELOPER`, `TEAM_MEMBER`,
`PRODUCT_LEADER`, `TECH_LEADER`, `ADMIN`). A link is visible to all users if `allowedRoles` is omitted, otherwise
only to users whose role matches. `RoleContextSwitcher.tsx` lets a user switch their effective role context (relevant
for local development and demoing role-gated views).

## Core Principles

### 1. Reduce Cognitive Load
- Users should immediately see what needs their attention
- De-emphasize low-priority items rather than hiding them completely
- Use visual hierarchy to guide focus (size, opacity, color)

### 2. Bucket-Based Prioritization
Vulnerabilities are categorized into buckets based on risk scores:
- **Snarest** (≥ criticalThreshold): Must be handled immediately
- **Må prioriteres** (≥ highThreshold, < criticalThreshold): Must be prioritized
- **Må planlegges** (≥ mediumThreshold, < highThreshold): Must be scheduled
- **Når det passer seg** (< mediumThreshold): Handle when convenient

The **Snarest** bucket should always be visually emphasized — larger, more prominent, full opacity. Other buckets
should appear secondary.

### 3. Group by Workload
When displaying vulnerabilities, group them by workload to help users understand the scope of work per application.

### Threshold Configuration
Thresholds are fetched from `/api/config` (which proxies to the backend) and have sensible defaults:
```typescript
const criticalThreshold = config?.thresholds.critical ?? 75;
const highThreshold = config?.thresholds.high ?? 50;
const mediumThreshold = config?.thresholds.medium ?? 25;
```

## UX Guidelines

### Visual Emphasis
- Critical items: Full opacity, larger size, prominent colors
- Lower priority items: Reduced opacity (0.75), smaller scale (0.95)

### Feedback & Encouragement
- Show positive feedback when no critical vulnerabilities exist ("🙌 Ingen kritiske sårbarheter!")
- Show counts and summaries to give users a sense of progress

### Interactivity
- Bucket cards should be clickable to filter the vulnerability list
- Selected bucket should have a visible border highlight
- Use transitions for smooth visual feedback
