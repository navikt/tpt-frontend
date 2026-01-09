"use client";
import {Tag, Popover, Button, Table} from "@navikt/ds-react";
import {useState} from "react";

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
    const [openState, setOpenState] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    return (
        <>
            <b>Risk score:</b>{" "}
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
                    <b>Risk score utregning</b>
                    {vuln.riskScoreMultipliers ? (
                        <Table style={{fontSize: "0.875rem"}}>
                            <Table.Body>
                                <Table.Row>
                                    <Table.DataCell>Fra CVE:</Table.DataCell>
                                    <Table.DataCell>{vuln.riskScoreMultipliers.severity}</Table.DataCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.DataCell>Eksponert ingress:</Table.DataCell>
                                    <Table.DataCell>{vuln.riskScoreMultipliers.exposure}x</Table.DataCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.DataCell>KEV:</Table.DataCell>
                                    <Table.DataCell>{vuln.riskScoreMultipliers.kev}x</Table.DataCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.DataCell>EPSS:</Table.DataCell>
                                    <Table.DataCell>{vuln.riskScoreMultipliers.epss}x</Table.DataCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.DataCell>I produksjon:</Table.DataCell>
                                    <Table.DataCell>{vuln.riskScoreMultipliers.production}x</Table.DataCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.DataCell>Gammelt bygg:</Table.DataCell>
                                    <Table.DataCell>{vuln.riskScoreMultipliers.old_build}x{" "}
                                        (Dager siden sist bygg:{" "}{vuln.riskScoreMultipliers.old_build_days})
                                    </Table.DataCell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    ) : (
                        ("Beregningsdata ikke tilgjengelig")
                    )}
                </Popover.Content>
            </Popover>
        </>
    );
};

export default WorkloadRiskScoreValue;
