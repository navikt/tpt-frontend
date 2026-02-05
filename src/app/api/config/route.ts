import { NextResponse } from "next/server";
import { getBackendCacheTime } from "@/app/utils/backendCache";
import { parseProblemDetails, getErrorMessageKey } from "@/app/shared/utils/errorHandling";

// Hardcoded fallback values
const FALLBACK_THRESHOLDS = {
  high: 150,
  medium: 75,
  low: 30,
};

const FALLBACK_DEPLOYMENT_AGE_DAYS = 90;

export async function GET() {
  const tptBackendUrl = process.env.TPT_BACKEND_URL;

  // Try to fetch from backend first
  if (tptBackendUrl) {
    try {
      const response = await fetch(`${tptBackendUrl}/config`, {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: getBackendCacheTime() },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          thresholds: {
            high: data.thresholds.high,
            medium: data.thresholds.medium,
            low: data.thresholds.low,
          },
          deploymentAgeDays: data.deploymentAgeDays ?? FALLBACK_DEPLOYMENT_AGE_DAYS,
        });
      } else {
        const errorBody = await response.json().catch(() => null);
        
        console.warn(
          `Backend config error: ${response.status} ${response.statusText}. Using fallback values.`,
          errorBody
        );
        
        // For non-critical config fetch, still return fallback but log the issue
        // Only return error response for severe failures (5xx)
        if (response.status >= 500) {
          // Try to parse RFC 9457 Problem Details
          const problemDetails = parseProblemDetails(errorBody);
          
          if (problemDetails) {
            // Backend returned Problem Details - use them directly
            return NextResponse.json(
              {
                ...problemDetails,
                isReportable: true,
              },
              { status: response.status }
            );
          }
          
          // Fallback to generic error
          const errorMessage = getErrorMessageKey(
            response.status,
            "errors.fetchConfigError"
          );
          
          return NextResponse.json(
            {
              error: errorMessage,
              status: response.status,
              details: errorBody?.message || errorBody?.error,
              isReportable: true,
            },
            { status: response.status }
          );
        }
      }
    } catch (error) {
      console.warn("Error fetching config from backend, using fallback values:", error);
    }
  } else {
    console.warn("TPT_BACKEND_URL not configured, using fallback threshold values.");
  }

  // Fallback to hardcoded values
  return NextResponse.json({
    thresholds: FALLBACK_THRESHOLDS,
    deploymentAgeDays: FALLBACK_DEPLOYMENT_AGE_DAYS,
  });
}
