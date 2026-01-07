"use client";
import {Tag, BodyShort, Popover, Button} from "@navikt/ds-react";
import {useState} from "react";

interface VulnerabilityWithMultipliers {
    riskScore: number;
    riskScoreMultipliers?: {
        base_high: number;
        exposure: number;
        kev: number;
        epss: number;
        production: number;
        old_build_days: number;
        old_build: number;
    };
}

const WorkloadRiskScoreCell = ({vuln}: {
    vuln: VulnerabilityWithMultipliers;
}) => {
    const [openState, setOpenState] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    return (
        <>
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
                    <BodyShort spacing size="small">
                        <b>Risk score utregning</b>
                    </BodyShort>
                    {vuln.riskScoreMultipliers ? (
                            <table style={{fontSize: "0.875rem"}}>
                                <tr>
                                    <td>Fra CVE:</td>
                                    <td>{vuln.riskScoreMultipliers.base_high}</td>
                                </tr>
                                <tr>
                                    <td>Eksponert ingress:</td>
                                    <td>{vuln.riskScoreMultipliers.exposure}x</td>
                                </tr>
                                <tr>
                                    <td>KEV:</td>
                                    <td>{vuln.riskScoreMultipliers.kev}x</td>
                                </tr>
                                <tr>
                                    <td>EPSS:</td>
                                    <td>{vuln.riskScoreMultipliers.epss}x</td>
                                </tr>
                                <tr>
                                    <td>I produksjon:</td>
                                    <td>{vuln.riskScoreMultipliers.production}x</td>
                                </tr>
                                <tr>
                                    <td>Gammelt bygg:</td>
                                    <td>{vuln.riskScoreMultipliers.old_build}x{" "}
                                    (Dager siden sist bygg:{" "}{vuln.riskScoreMultipliers.old_build_days})</td>
                                </tr>
                            </table>
                    ) : (
                        <BodyShort size="small">Beregningsdata ikke tilgjengelig</BodyShort>
                    )}
                </Popover.Content>
            </Popover>
        </>
    );
};

export default WorkloadRiskScoreCell;
