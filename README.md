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
npm install

# Kjør utviklingsserver
npm run dev

# Bygg for produksjon
npm run build

# Kjør produksjonsbygget
npm start

# Kjør linter
npm run lint
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

### Konfigurasjon

#### Risk Score Thresholds

Applikasjonen bruker tre konfigurerbare terskelverdier for risikoskåre:

- **RISK_SCORE_THRESHOLD_ASAP** (default: 100) - "FIX ASAP" - Vises på forsiden som prioriterte sårbarheter
- **RISK_SCORE_THRESHOLD_WHEN_TIME** (default: 50) - "Fix when you have time" 
- **RISK_SCORE_THRESHOLD_IF_BORED** (default: 25) - "Fix if bored"

Disse kan konfigureres via miljøvariabler i `.nais/nais.yaml` eller lokalt i miljøet ditt.

---

## Henvendelser

Spørsmål knyttet til koden eller repositoryet kan stilles som issues her på GitHub.

### For Nav-ansatte

Interne henvendelser kan sendes via Slack i kanalen **#appsec**.
