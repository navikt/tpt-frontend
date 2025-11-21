import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const baseUrl = process.env.TPT_BACKEND_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "TPT_BACKEND_URL not configured" },
      { status: 500 }
    );
  }

  const headersList = await headers();
  const authorization = headersList.get("authorization");

  // Debug: Log available headers
  console.log("Available headers:", Array.from(headersList.entries()));
  console.log("Authorization header:", authorization);

  if (!authorization) {
    return NextResponse.json(
      { error: "No authorization header found" },
      { status: 401 }
    );
  }

  try {
    console.log("Fetching applications from", `${baseUrl}/applications/user`);
    const response = await fetch(`${baseUrl}/applications/user`, {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Error response from backend:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Fetched applications:", JSON.stringify(data));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
