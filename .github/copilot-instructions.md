# Titt på ting (TPT) - Copilot Instructions

## Project Overview

**Titt på ting** is a vulnerability prioritization tool designed to help NAV teams focus on what matters. The core philosophy is to **filter out noise** and help users understand which vulnerabilities require immediate attention versus which ones can wait.

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

The **Snarest** bucket should always be visually emphasized - larger, more prominent, full opacity. Other buckets should appear secondary.

### 3. Group by Workload
When displaying vulnerabilities, group them by workload to help users understand the scope of work per application.

## Tech Stack

> ⚠️ **Read `node_modules/next/dist/docs/` before writing Next.js code.** This project uses Next.js 16 — APIs and conventions may differ significantly from training data. Heed deprecation notices.

- **Framework**: Next.js 16 (App Router, Turbopack, React Compiler enabled)
- **Language**: TypeScript
- **Design System**: NAV Aksel (`@navikt/ds-react`, `@navikt/aksel-icons`)
- **i18n**: `next-intl` with locales `nb` (default) and `en`. Messages in `messages/nb.json` and `messages/en.json`.
- **Data Source**: Vulnerability data from Nais and GitHub via `tpt-backend`. Frontend proxies all backend calls through `/api/*` route handlers.
- **Auth**: Nais OAuth with On-Behalf-Of (OBO) flow via `@navikt/oasis`. User info extracted from JWT `preferred_username` claim.
- **Observability**: Grafana Faro Web SDK (`src/instrumentation/faro.ts`)

## Clean Code & Best Practices

- Always follow current best practices for the framework and language versions in use. Do not rely on outdated patterns from earlier versions.
- When migrating or refactoring, fully replace old code. Never keep deprecated APIs, legacy wrappers, or backward-compatibility shims — clean up completely.
- Remove dead code, unused imports, and obsolete files as part of every change.
- Prefer small, focused components and functions with a single responsibility.
- Use TypeScript strictly — avoid `any`, prefer explicit types, and leverage inference where it keeps code readable.

## Code Patterns

### Component Structure
- Use `"use client"` directive for components with state or interactivity
- Keep data fetching in custom hooks (`useVulnerabilities`, `useConfig`)
- Co-locate related components in feature folders

### Styling Guidelines
- Use Aksel components (`Box`, `HStack`, `VStack`, `Heading`, `BodyShort`, etc.)
- Use CSS variables for colors: `var(--a-surface-danger)`, `var(--a-surface-success)`, etc.
- Use inline styles for dynamic values; prefer Aksel's built-in props otherwise
- Follow the spacing rules in `.github/instructions/nextjs-aksel.instructions.md`

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

## Language

The UI is in Norwegian (Bokmål) with English translation available. All user-facing strings live in `messages/nb.json` and `messages/en.json` — use `next-intl` translation keys, never hardcoded strings. See `.github/instructions/language.instructions.md` for domain terminology.
