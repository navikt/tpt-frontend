"use client";
import {Tag, Popover, Button, Table} from "@navikt/ds-react";
import {useState} from "react";
import { useTranslations } from "next-intl";

interface VulnerabilityWithMultipliers {
    riskScore: number;
    riskScoreMultipliers?: {
        severity: number;
        exposure: number;
        kev: number;
        epss: number;
        production: number;
        old_build_days: number;
        old_build: number;
    };
}

const WorkloadRiskScoreValue = ({vuln}: {
    vuln: VulnerabilityWithMultipliers;
}) => {
    const t = useTranslations("workload");
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
                        vuln.riskScore > 85
                            ? "error"
                            : vuln.riskScore > 50
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
                    {vuln.riskScoreMultipliers ? (
                        <Table style={{fontSize: "0.875rem"}}>
                            <Table.Body>
                                <Table.Row>
                                    <Table.DataCell>{t("fromCVE")}</Table.DataCell>
                                    <Table.DataCell>{vuln.riskScoreMultipliers.severity}</Table.DataCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.DataCell>{t("exposedIngress")}</Table.DataCell>
                                    <Table.DataCell>{vuln.riskScoreMultipliers.exposure}x</Table.DataCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.DataCell>{t("kev")}</Table.DataCell>
                                    <Table.DataCell>{vuln.riskScoreMultipliers.kev}x</Table.DataCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.DataCell>{t("epss")}</Table.DataCell>
                                    <Table.DataCell>{vuln.riskScoreMultipliers.epss}x</Table.DataCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.DataCell>{t("production")}</Table.DataCell>
                                    <Table.DataCell>{vuln.riskScoreMultipliers.production}x</Table.DataCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.DataCell>{t("oldBuild")}</Table.DataCell>
                                    <Table.DataCell>{vuln.riskScoreMultipliers.old_build}x{" "}
                                        ({t("daysSinceLastBuild")}{" "}{vuln.riskScoreMultipliers.old_build_days})
                                    </Table.DataCell>
                                </Table.Row>
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
