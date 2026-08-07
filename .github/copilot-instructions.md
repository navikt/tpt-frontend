# Titt på ting (TPT) - Copilot Instructions

**Titt på ting** is a vulnerability prioritization tool designed to help NAV teams focus on what matters. The core
philosophy is to **filter out noise** and help users understand which vulnerabilities require immediate attention
versus which ones can wait.

## Task discipline (applies to every task)

- Break work into small tasks; verify one step before moving to the next. If in doubt, ask for clarification and
  do not stray beyond the requested scope (e.g. don't add docs or extend functionality unprompted).
- Do NOT add code comments unless the logic is genuinely complex.
- Do NOT add documentation files or explanations unless specifically asked — **except** the root `README.md`,
  which must be kept concise and updated whenever functionality, packages, or folder structure change.
- Keep existing instruction files (`.github/instructions/*.instructions.md`) in sync with the code they describe.
  If a change makes one inaccurate — a renamed pattern, a changed env var or default, a replaced integration —
  update that file in the same commit. This is maintenance of what already exists, not adding new documentation.

## Reference

Loaded automatically by Copilot when editing matching files — no need to open manually:

- [Architecture & domain](instructions/architecture.instructions.md) — tech stack, modular structure, bucket-based prioritization, UX guidelines
- [Next.js & Aksel patterns](instructions/nextjs-aksel.instructions.md) — component structure, code quality, spacing tokens, API routes, auth, testing
- [Language & domain terminology](instructions/language.instructions.md) — i18n conventions, Norwegian/English domain terms
- [Observability](instructions/observability.instructions.md) — Faro instrumentation patterns
