"use client";
import {Heading, BodyShort, ExpansionCard} from "@navikt/ds-react";

const WorkloadExplanationCard = () => {
    const accordionItemSpacing = "1.5rem";

    return (
        <ExpansionCard aria-label="Forklaring av termer og risikoskåring">
            <ExpansionCard.Header>
                <Heading size={"medium"}>Forklaring av termer og risikoskåring</Heading>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                <Heading size="xsmall">KEV (Known Exploited Vulnerabilities)</Heading>
                <BodyShort style={{marginBottom: accordionItemSpacing}}>
                    KEV er en liste fra CISA (Cybersecurity and Infrastructure Security
                    Agency) over sårbarheter som er aktivt utnyttet på nettet.
                    KEV-oppføringer representerer en reell, dokumentert trussel.
                </BodyShort>

                <Heading size="xsmall">
                    EPSS (Exploit Prediction Scoring System)
                </Heading>
                <BodyShort style={{marginBottom: accordionItemSpacing}}>
                    EPSS er et datastyrt system som beregner sannsynligheten for at en
                    sårbarhet vil bli utnyttet de neste 30 dagene. Høyere EPSS-verdi
                    indikerer større sannsynlighet for aktiv utnyttelse.
                </BodyShort>

                <Heading size="xsmall">Ingress Types</Heading>
                <BodyShort spacing>
                    <b>External:</b> Applikasjonen er eksponert mot internett uten
                    autentisering. Dette gir størst angrepsflate.
                </BodyShort>
                <BodyShort spacing>
                    <b>Authenticated:</b> Applikasjonen er eksponert mot internett, men
                    krever autentisering. Dette gir moderat økt risiko.
                </BodyShort>
                <BodyShort spacing>
                    <b>Internal:</b> Applikasjonen er kun tilgjengelig internt i
                    nettverket. Dette gir normal risiko.
                </BodyShort>
                <BodyShort style={{marginBottom: accordionItemSpacing}}>
                    <b>Unknown/None:</b> Ingen ingress er konfigurert. Dette betyr at
                    applikasjonen kun er tiljengelig via service discovery.
                </BodyShort>

                <Heading size="xsmall">Risk Score</Heading>
                <BodyShort>
                    Risikoskåren beregnes ved å ta hensyn til flere faktorer inkludert
                    CVE severity, KEV-status, EPSS-skåre, ingress type, produksjonsmiljø
                    og byggets alder. Høyere verdi betyr at det haster mer.
                </BodyShort>
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};

export default WorkloadExplanationCard;
