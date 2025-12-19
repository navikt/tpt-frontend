"use client";
import { Tag, Heading, BodyShort, Popover, Button } from "@navikt/ds-react";
import { useState } from "react";

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

const WorkloadRiskScoreCell = ({
  vuln,
}: {
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
        size="small"
        style={{ padding: 0 }}
      >
        <Tag
          variant={
            vuln.riskScore > 85
              ? "error"
              : vuln.riskScore > 50
              ? "warning"
              : "success"
          }
          size="small"
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
            <b>Risk Score Multipliers</b>
          </BodyShort>
          {vuln.riskScoreMultipliers ? (
            <div style={{ fontSize: "0.875rem" }}>
              <BodyShort size="small">
                <b>Base (High):</b> {vuln.riskScoreMultipliers.base_high}
              </BodyShort>
              <BodyShort size="small">
                <b>Exposure:</b> {vuln.riskScoreMultipliers.exposure}x
              </BodyShort>
              <BodyShort size="small">
                <b>KEV:</b> {vuln.riskScoreMultipliers.kev}x
              </BodyShort>
              <BodyShort size="small">
                <b>EPSS:</b> {vuln.riskScoreMultipliers.epss}x
              </BodyShort>
              <BodyShort size="small">
                <b>Production:</b> {vuln.riskScoreMultipliers.production}x
              </BodyShort>
              <BodyShort size="small">
                <b>Old Build Days:</b>{" "}
                {vuln.riskScoreMultipliers.old_build_days}
              </BodyShort>
              <BodyShort size="small">
                <b>Old Build:</b> {vuln.riskScoreMultipliers.old_build}x
              </BodyShort>
            </div>
          ) : (
            <BodyShort size="small">No multiplier data available</BodyShort>
          )}
        </Popover.Content>
      </Popover>
    </>
  );
};

export default WorkloadRiskScoreCell;
