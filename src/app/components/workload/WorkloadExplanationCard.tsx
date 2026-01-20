"use client";
import {Heading, BodyShort, ExpansionCard} from "@navikt/ds-react";
import { useTranslations } from "next-intl";

const WorkloadExplanationCard = () => {
    const t = useTranslations("workload");
    const accordionItemSpacing = "1.5rem";

    return (
        <ExpansionCard aria-label={t("explanationTitle")}>
            <ExpansionCard.Header>
                <Heading size={"medium"}>{t("explanationTitle")}</Heading>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                <Heading size="xsmall">{t("kev.heading")}</Heading>
                <BodyShort style={{marginBottom: accordionItemSpacing}}>
                    {t("kev.description")}
                </BodyShort>

                <Heading size="xsmall">
                    {t("epss.heading")}
                </Heading>
                <BodyShort style={{marginBottom: accordionItemSpacing}}>
                    {t("epss.description")}
                </BodyShort>

                <Heading size="xsmall">{t("ingressTypes.heading")}</Heading>
                <BodyShort spacing>
                    {t("ingressTypes.external")}
                </BodyShort>
                <BodyShort spacing>
                    {t("ingressTypes.authenticated")}
                </BodyShort>
                <BodyShort spacing>
                    {t("ingressTypes.internal")}
                </BodyShort>
                <BodyShort style={{marginBottom: accordionItemSpacing}}>
                    {t("ingressTypes.unknown")}
                </BodyShort>

                <Heading size="xsmall">{t("riskScoreHeading")}</Heading>
                <BodyShort>
                    {t("riskScoreDescription")}
                </BodyShort>
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};

export default WorkloadExplanationCard;
