# Titt på Ting (TPT) Frontend

Frontend application for Titt på Ting - a vulnerability prioritization tool for applications.

TPT analyzes and ranks vulnerabilities based on multiple factors such as KEV (Known Exploited Vulnerabilities), EPSS (Exploit Prediction Scoring System), exposure, production environment, and build age. This enables teams to focus on the most critical vulnerabilities that pose actual risk.

## Getting Started

### Prerequisites

- Node.js (version 24 or newer)
- pnpm

### Installation and Running

```bash
# Install dependencies
pnpm install

# Run development server with mocks
pnpm run dev:mocks

# Build for production
pnpm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Local Development Against Backend

To run the frontend against a local backend (e.g., `http://localhost:8080`):

1. Start the development server:

```bash
pnpm run dev:local
```

In local development mode:
- TokenX/OBO authentication is bypassed
- A mock JWT token is automatically generated with `lokal.utvikler@nav.no` as the user
- API calls go directly to the configured backend URL

You can change `LOCAL_DEV_EMAIL` to a different email address if you want to simulate a different user.

The backend is available at (navikt/tpt-backend)[https://github.com/navikt/tpt-backend]. 
Requires docker to be running and can be started with `./gradlew runLocalDev`.

### Environment Variables

The application uses the following environment variables (configured in `.env.local` for local development):

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LOCAL_DEV` | Enables local development mode (bypasses authentication) | `false` | No |
| `LOCAL_DEV_EMAIL` | Email address for mock user in local mode | `lokal.utvikler@nav.no` | No |
| `TPT_BACKEND_URL` | URL to TPT backend API | `http://localhost:8080` | Yes |
| `BACKEND_CACHE_SECONDS` | Cache duration for backend data in seconds | `300` (5 minutes) | No |
| `TELEMETRY_URL` | URL for Faro telemetry (fetched at runtime) | - | No |

**Important about telemetry:** `TELEMETRY_URL` is read at runtime (not build-time) and sent to the client via `/api/telemetry-config`. This allows the same Docker image to be used across environments with different telemetry endpoints.

### Pre-commit Hooks

The project uses Husky to run automatic checks before each commit:
- Linter runs on all files
- Tests run on changed files

This ensures code quality before code is pushed to the repository.

## Contact

Questions related to the code or repository can be submitted as issues here on GitHub.

### For NAV Employees

Internal inquiries can be sent via Slack in the **#appsec** channel.
