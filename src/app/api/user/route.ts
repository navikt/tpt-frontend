import { NextResponse } from "next/server";
import { isLocalDev, getLocalDevEmail } from "@/app/utils/localDevAuth";

export async function GET(request: Request) {
  // In local dev mode, return the configured local dev email
  if (isLocalDev()) {
    const email = getLocalDevEmail();
    console.log("Local dev mode - returning email:", email);
    return NextResponse.json({ email });
  }

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Decode JWT token (simple base64 decode of payload)
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) {
      return NextResponse.json({ error: "Invalid token format" }, { status: 401 });
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    const email = payload.preferred_username;

    if (!email) {
      return NextResponse.json({ error: "No preferred_username in token" }, { status: 401 });
    }

    return NextResponse.json({ email });
  } catch (error) {
    console.error("Error parsing token:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
