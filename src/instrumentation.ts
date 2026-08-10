import type { Instrumentation } from "next";

/**
 * Returns true for errors that represent a browser closing an SSE connection.
 * These are expected during normal use (tab closed, navigation, token refresh)
 * and should not be logged as errors.
 */
function isSseClientDisconnect(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  // Next.js wraps the underlying socket error in a chain:
  // Error: failed to pipe response -> TypeError: terminated -> SocketError: other side closed
  const isSelf =
    error.message === "failed to pipe response" ||
    error.message === "terminated";

  const cause = (error as NodeJS.ErrnoException & { cause?: unknown }).cause;

  if (isSelf) return true;

  if (cause instanceof Error) {
    const code = (cause as NodeJS.ErrnoException).code;
    if (
      code === "UND_ERR_SOCKET" ||
      cause.message === "other side closed" ||
      cause.message === "terminated"
    ) {
      return true;
    }
    // Check one level deeper (Next.js wraps twice)
    const inner = (cause as { cause?: unknown }).cause;
    if (inner instanceof Error) {
      const innerCode = (inner as NodeJS.ErrnoException).code;
      if (innerCode === "UND_ERR_SOCKET" || inner.message === "other side closed") {
        return true;
      }
    }
  }

  return false;
}

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context
) => {
  if (context.routeType === "route" && isSseClientDisconnect(error)) {
    return;
  }

  console.error("[request error]", {
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    error,
  });
};
