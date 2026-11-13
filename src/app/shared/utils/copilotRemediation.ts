import type { CopilotOutcome } from "@/app/shared/types/copilotRemediation";

export const COPILOT_OUTCOME_PARAM = "copilot";
export const COPILOT_STATUS_PARAM = "copilotStatus";

const MAX_RETURN_PATH_LENGTH = 2048;

export function isSafeReturnPath(value: unknown): value is string {
  return typeof value === "string" &&
    value.length <= MAX_RETURN_PATH_LENGTH &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\u0000-\u001f\u007f]/.test(value);
}

export function withCopilotOutcome(path: string, outcome: CopilotOutcome, status?: number): string {
  const url = new URL(isSafeReturnPath(path) ? path : "/", "http://localhost");
  if (url.pathname.startsWith("//")) url.pathname = "/";
  url.searchParams.set(COPILOT_OUTCOME_PARAM, outcome);
  if (status !== undefined) url.searchParams.set(COPILOT_STATUS_PARAM, String(status));
  return `${url.pathname}${url.search}${url.hash}`;
}

export function withoutCopilotOutcome(path: string): string {
  const url = new URL(path, "http://localhost");
  url.searchParams.delete(COPILOT_OUTCOME_PARAM);
  url.searchParams.delete(COPILOT_STATUS_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function copilotErrorKey(status?: number): string {
  switch (status) {
    case 400:
      return "errors.authorizationFailed";
    case 403:
      return "errors.forbidden";
    case 404:
      return "errors.notFound";
    case 409:
      return "errors.conflict";
    case 503:
      return "errors.unavailable";
    default:
      return "errors.generic";
  }
}

function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Mirrors the backend's version-independent package identity used to deduplicate remediations. */
export function packageIdentity(packageName?: string | null): string {
  const value = packageName?.trim() ?? "";
  if (!value.startsWith("pkg:")) return value.toLowerCase();

  const path = value.slice(4).replace(/^\/+/, "").split(/[?#]/, 1)[0] ?? "";
  const [type, ...rest] = path.split("/").filter((segment) => segment.length > 0);
  const last = rest.pop();
  if (!type || last === undefined) return value.toLowerCase();

  const namespace = rest.map(decodeSegment);
  const at = last.lastIndexOf("@");
  const name = decodeSegment(at >= 0 ? last.slice(0, at) : last);
  const identity =
    type.toLowerCase() === "maven" && namespace.length > 0 ? `${namespace.join(".")}:${name}` : [...namespace, name].join("/");
  return identity.toLowerCase();
}
