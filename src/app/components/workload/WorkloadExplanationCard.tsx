"use client";
import {Heading, BodyShort, ExpansionCard} from "@navikt/ds-react";
import { useTranslations } from "next-intl";

const WorkloadExplanationCard = () => {
    const t = useTranslations("workload");

    return (
        <ExpansionCard aria-label={t("explanationTitle")}>
            <ExpansionCard.Header>
                <Heading size={"medium"}>{t("explanationTitle")}</Heading>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                <Heading size="xsmall">{t("riskScoreHeading")}</Heading>
                <BodyShort>
                    {t("riskScoreDescription")}
                </BodyShort>
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};

export default WorkloadExplanationCard;
