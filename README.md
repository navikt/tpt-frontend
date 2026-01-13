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
npm ci

# Kjør utviklingsserver
export MOCKS_ENABLED="true" # For standalone kjøring med mock data
npm run dev

# Bygg for produksjon
npm run build

# Kjør produksjonsbygget
npm start

# Kjør linter
npm run lint
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

### Lokal utvikling mot backend

For å kjøre frontend mot en lokal backend (f.eks. `http://localhost:8080`):

1. Start utviklingsserveren:

```bash
npm run dev
```

I lokal utviklingsmodus:
- Autentisering med TokenX/OBO blir hoppet over
- En mock JWT token genereres automatisk med `lokal.utvikler@nav.no` som bruker
- API-kall går direkte til den konfigurerte backend-URLen

Du kan endre `LOCAL_DEV_EMAIL` til en annen e-postadresse hvis du vil simulere en annen bruker.


## Henvendelser

Spørsmål knyttet til koden eller repositoryet kan stilles som issues her på GitHub.

### For Nav-ansatte

Interne henvendelser kan sendes via Slack i kanalen **#appsec**.
