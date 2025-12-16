import { NextResponse } from "next/server";

export async function GET() {
  const asapThreshold = parseInt(
    process.env.RISK_SCORE_THRESHOLD_ASAP || "100",
    10
  );
  const whenTimeThreshold = parseInt(
    process.env.RISK_SCORE_THRESHOLD_WHEN_TIME || "50",
    10
  );
  const ifBoredThreshold = parseInt(
    process.env.RISK_SCORE_THRESHOLD_IF_BORED || "25",
    10
  );

  return NextResponse.json({
    thresholds: {
      asap: asapThreshold,
      whenTime: whenTimeThreshold,
      ifBored: ifBoredThreshold,
    },
  });
}
