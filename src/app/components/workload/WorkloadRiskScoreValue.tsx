"use client";
import {Tag, Popover, Button, Table, BodyShort} from "@navikt/ds-react";
import {useState} from "react";
import { useTranslations } from "next-intl";
import type {Vulnerability} from "@/app/shared/types/vulnerabilities";

const WorkloadRiskScoreValue = ({vuln}: {
    vuln: Vulnerability;
}) => {
    const t = useTranslations("workload");
    const tFactors = useTranslations("riskFactors");
    const [openState, setOpenState] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    return (
        <>
            <b>{t("riskScore")}</b>{" "}
            <Button
                ref={(el) => setAnchorEl(el)}
                onClick={() => setOpenState(!openState)}
                variant="tertiary"
                size="medium"
                style={{padding: 0}}
            >
                <Tag
                    variant={
                        vuln.riskScore >= 75
                            ? "error"
                            : vuln.riskScore >= 50
                                ? "warning"
                                : "success"
                    }
                    size="medium"
                >
                    {Math.round(vuln.riskScore)}
                </Tag>
            </Button>
            <Popover
                open={openState}
                onClose={() => setOpenState(false)}
                anchorEl={anchorEl}
                placement="right"
            >
                <Popover.Content>
                    <b>{t("riskScoreCalculation")}</b>
                    {vuln.riskScoreBreakdown?.factors ? (
                        <Table style={{fontSize: "0.875rem"}}>
                            <Table.Body>
                                {vuln.riskScoreBreakdown.factors.map((factor) => (
                                    <Table.Row key={factor.name}>
                                        <Table.DataCell>
                                            <span>{tFactors(factor.name as Parameters<typeof tFactors>[0])}</span>
                                            {factor.explanation && (
                                                <BodyShort size="small" style={{color: "var(--a-text-subtle)"}}>
                                                    {factor.explanation}
                                                </BodyShort>
                                            )}
                                        </Table.DataCell>
                                        <Table.DataCell>{factor.points}/{factor.maxPoints}</Table.DataCell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    ) : (
                        (t("calculationDataUnavailable"))
                    )}
                </Popover.Content>
            </Popover>
        </>
    );
};

export default WorkloadRiskScoreValue;
