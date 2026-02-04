# Titt på Ting (TPT) Frontend

Frontend-applikasjon for Titt på Ting - et prioriteringsverktøy for sårbarheter i applikasjoner.

TPT analyserer og rangerer sårbarheter basert på flere faktorer som KEV (Known Exploited Vulnerabilities), EPSS (Exploit Prediction Scoring System), eksponering, produksjonsmiljø og byggets alder. Dette gir teams mulighet til å fokusere på de mest kritiske sårbarhetene som faktisk utgjør en reell risiko.

## Komme i gang

### Forutsetninger

- Node.js (versjon 24 eller nyere)
- npm

### Installasjon og kjøring

```bash
# Installer avhengigheter
pnpm install

# Kjør utviklingsserver med mocks
pnpm run dev:mocks

# Bygg for produksjon
pnpm run build
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

### Lokal utvikling mot backend

For å kjøre frontend mot en lokal backend (f.eks. `http://localhost:8080`):

1. Start utviklingsserveren:

```bash
pnpm run dev:local
```

I lokal utviklingsmodus:
- Autentisering med TokenX/OBO blir hoppet over
- En mock JWT token genereres automatisk med `lokal.utvikler@nav.no` som bruker
- API-kall går direkte til den konfigurerte backend-URLen

Du kan endre `LOCAL_DEV_EMAIL` til en annen e-postadresse hvis du vil simulere en annen bruker.

### Miljøvariabler

Applikasjonen bruker følgende miljøvariabler (konfigureres i `.env.local` for lokal utvikling):

| Variabel | Beskrivelse | Standard | Påkrevd |
|----------|-------------|----------|---------|
| `LOCAL_DEV` | Aktiverer lokal utviklingsmodus (hopper over autentisering) | `false` | Nei |
| `LOCAL_DEV_EMAIL` | E-postadresse for mock-bruker i lokal modus | `lokal.utvikler@nav.no` | Nei |
| `TPT_BACKEND_URL` | URL til TPT backend API | `http://localhost:8080` | Ja |
| `BACKEND_CACHE_SECONDS` | Cache-varighet for backend-data i sekunder | `300` (5 minutter) | Nei |
| `TELEMETRY_URL` | URL for Faro telemetri (hentes runtime) | - | Nei |

**Viktig om telemetri:** `TELEMETRY_URL` blir lest ved runtime (ikke build-time) og sendes til klienten via `/api/telemetry-config`. Dette gjør at samme Docker-image kan brukes på tvers av miljøer med ulike telemetri-endepunkter.

### Pre-commit Hooks

Prosjektet bruker Husky for å kjøre automatiske sjekker før hver commit:
- Linter kjører på alle filer
- Tester kjører på filer som er endret

Dette sikrer kodekvalitet før kode pushes til repository.

## Henvendelser

Spørsmål knyttet til koden eller repositoryet kan stilles som issues her på GitHub.

### For Nav-ansatte

Interne henvendelser kan sendes via Slack i kanalen **#appsec**.
