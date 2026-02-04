import { getFaroInstance } from "@/instrumentation/faro";

export interface ApiError {
  message: string;
  traceId?: string;
  status?: number;
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
  if (error instanceof Error) {
    if (isNetworkError(error)) {
      message = "errors.networkError";
    } else {
      // For non-network errors, return the actual error message
      return {
        message: error.message,
        ...(traceId && { traceId }),
      };
    }
  }

  return {
    message,
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
