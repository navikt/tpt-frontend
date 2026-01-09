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
- **Høy prio** (≥ highThreshold): Should be handled immediately
- **Lurt å ta unna** (≥ mediumThreshold, < highThreshold): Should be prioritized
- **Når du har tid** (≥ lowThreshold, < mediumThreshold): Handle when convenient
- **Lav prioritet** (< lowThreshold): Can wait

The **Høy prio** bucket should always be visually emphasized - larger, more prominent, full opacity. Other buckets should appear secondary.

### 3. Group by Workload
When displaying vulnerabilities, group them by workload to help users understand the scope of work per application.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Design System**: NAV Aksel (`@navikt/ds-react`, `@navikt/aksel-icons`)
- **Data Source**: Data from from nais console and other sources via tpt-backend.

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

### Data Types
```typescript
// Key interfaces in src/app/types/vulnerabilities.ts
interface Vulnerability {
  identifier: string;
  packageName: string;
  riskScore: number;
  riskScoreMultipliers?: RiskScoreMultipliers;
}

interface Workload {
  id: string;
  name: string;
  environment: string;
  repository?: string;
  ingressTypes?: string[];
  vulnerabilities: Vulnerability[];
}
```

### Threshold Configuration
Thresholds are fetched from `/api/config` (which proxies to the backend) and have sensible defaults:
```typescript
const highThreshold = config?.thresholds.high ?? 150;
const mediumThreshold = config?.thresholds.medium ?? 75;
const lowThreshold = config?.thresholds.low ?? 30;
```

## UX Guidelines

### Visual Emphasis
- Critical items: Full opacity, larger size, prominent colors
- Lower priority items: Reduced opacity (0.75), smaller scale (0.95), "Kan vente" labels

### Feedback & Encouragement
- Show positive feedback when no critical vulnerabilities exist ("🙌 Ingen kritiske sårbarheter!")
- Show counts and summaries to give users a sense of progress

### Interactivity
- Bucket cards should be clickable to filter the vulnerability list
- Selected bucket should have a visible border highlight
- Use transitions for smooth visual feedback

## Language

The UI is in Norwegian (Bokmål). Key terms:
- Sårbarhet/Sårbarheter = Vulnerability/Vulnerabilities
- Høy prio = High priority
- Lurt å ta unna = Smart to clear out
- Når du har tid = When you have time
- Lav prioritet = Low priority
- Kan vente = Can wait
- Applikasjon/applikasjoner = Workload/workloads
