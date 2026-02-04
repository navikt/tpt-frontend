import { NextResponse } from "next/server";

export async function GET() {
  const telemetryUrl = process.env.TELEMETRY_URL;
  
  return NextResponse.json({
    url: telemetryUrl || null,
  });
}
