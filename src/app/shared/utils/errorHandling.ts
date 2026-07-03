import { getFaroInstance } from "@/instrumentation/faro";

// RFC 9457 Problem Details structure
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown; // Extension members
}

export interface ApiError {
  message: string;
  traceId?: string;
  status?: number;
  details?: string;
  isReportable?: boolean;
  problemDetails?: ProblemDetails; // RFC 9457 Problem Details
}

export type ErrorCategory = 
  | "client" // 4xx - User/client error
  | "server" // 5xx - Server error
  | "network" // Network/connection error
  | "unknown";

/**
 * Parse RFC 9457 Problem Details from error response
 */
export function parseProblemDetails(errorData: unknown): ProblemDetails | null {
  if (!errorData || typeof errorData !== "object") return null;
  
  const data = errorData as Record<string, unknown>;
  
  // Check if it looks like Problem Details (has type, title, or detail)
  if (!data.type && !data.title && !data.detail) return null;
  
  return {
    type: typeof data.type === "string" ? data.type : undefined,
    title: typeof data.title === "string" ? data.title : undefined,
    status: typeof data.status === "number" ? data.status : undefined,
    detail: typeof data.detail === "string" ? data.detail : undefined,
    instance: typeof data.instance === "string" ? data.instance : undefined,
    ...data, // Include extension members
  };
}

/**
 * Create ApiError from RFC 9457 Problem Details
 */
export function apiErrorFromProblemDetails(
  problemDetails: ProblemDetails,
  fallbackMessage: string,
  traceId?: string
): ApiError {
  // Use title as the main message, detail as additional context
  const message = problemDetails.title || fallbackMessage;
  const details = problemDetails.detail;
  const status = problemDetails.status;
  
  return {
    message,
    status,
    details,
    traceId,
    isReportable: status ? status >= 500 : true,
    problemDetails,
  };
}

/**
 * Categorize error based on HTTP status code
 */
export function categorizeError(status?: number): ErrorCategory {
  if (!status) return "unknown";
  if (status >= 400 && status < 500) return "client";
  if (status >= 500) return "server";
  return "unknown";
}

/**
 * Check if error is reportable (server errors, not client errors)
 */
export function isReportableError(error: ApiError): boolean {
  if (error.isReportable !== undefined) return error.isReportable;
  
  const category = categorizeError(error.status);
  // Server errors and network errors should be reported
  // Client errors (400-499) are usually user mistakes
  return category === "server" || category === "network";
}

/**
 * Try to get trace ID from Faro's active span
 */
function getTraceIdFromFaro(): string | undefined {
  const faro = getFaroInstance();
  if (!faro) return undefined;

  try {
    const trace = faro.api?.getOTEL?.()?.trace;
    if (trace) {
      const span = trace.getActiveSpan();
      if (span) {
        const spanContext = span.spanContext();
        return spanContext.traceId || undefined;
      }
    }
  } catch {
    // Silently fail if Faro trace API is not available
  }
  
  return undefined;
}

/**
 * Log error to Faro and return structured error for UI
 */
export function handleApiError(
  error: unknown,
  context: string,
  additionalMeta?: Record<string, unknown>
): ApiError {
  const traceId = getTraceIdFromFaro();

  const faro = getFaroInstance();
  if (faro) {
    // Convert additional metadata to strings for Faro context
    const contextMeta: Record<string, string> = {};
    if (additionalMeta) {
      Object.entries(additionalMeta).forEach(([key, value]) => {
        contextMeta[key] = String(value);
      });
    }
    
    faro.api?.pushError(error instanceof Error ? error : new Error(String(error)), {
      type: context,
      context: contextMeta,
    });
  }

  const logMessage = traceId 
    ? `[${context}] Error (traceId: ${traceId}):`
    : `[${context}] Error:`;
  console.error(logMessage, error);

  // Return localized error message key for the most common errors
  let message = "errors.internalError";
  let status: number | undefined;
  let isReportable = true;

  if (error instanceof Error) {
    if (isNetworkError(error)) {
      message = "errors.networkError";
      isReportable = true;
    } else {
      // For non-network errors, return the actual error message
      return {
        message: error.message,
        ...(traceId && { traceId }),
        isReportable: true,
      };
    }
  }

  return {
    message,
    status,
    isReportable,
    ...(traceId && { traceId }),
  };
}

/**
 * Check if error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("fetch failed") ||
      message.includes("network") ||
      message.includes("econnrefused") ||
      message.includes("timeout")
    );
  }
  return false;
}

/**
 * Get user-friendly error message based on status code
 */
export function getErrorMessageKey(status: number, defaultKey: string): string {
  // 4xx client errors
  if (status === 400) return "errors.badRequest";
  if (status === 401) return "errors.unauthorized";
  if (status === 403) return "errors.forbidden";
  if (status === 404) return "errors.notFound";
  if (status === 429) return "errors.tooManyRequests";
  
  // 5xx server errors
  if (status === 500) return "errors.internalServerError";
  if (status === 502) return "errors.badGateway";
  if (status === 503) return "errors.serviceUnavailable";
  if (status === 504) return "errors.gatewayTimeout";
  
  // Fallback
  if (status >= 400 && status < 500) return "errors.clientError";
  if (status >= 500) return "errors.serverError";
  
  return defaultKey;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(
  error: unknown,
  defaultMessage: string
): string {
  if (isNetworkError(error)) {
    return "Kunne ikke koble til serveren. Vennligst prøv igjen senere.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return defaultMessage;
}
