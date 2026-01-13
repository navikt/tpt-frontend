/**
 * Local development authentication utilities
 * Used to simulate authentication when running locally against localhost backend
 */

/**
 * Creates a mock JWT token for local development
 * The token contains a preferred_username claim that matches the local user
 */
export function createLocalDevToken(email: string = "lokal.utvikler@nav.no"): string {
  const header = { alg: "none", typ: "JWT" };
  const payload = {
    preferred_username: email,
    sub: "local-dev-user",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  // For local dev, we don't need a real signature
  return `${encodedHeader}.${encodedPayload}.local-dev-signature`;
}

/**
 * Check if we're running in local development mode
 */
export function isLocalDev(): boolean {
  return process.env.LOCAL_DEV === "true";
}

/**
 * Get the local dev user email
 */
export function getLocalDevEmail(): string {
  return process.env.LOCAL_DEV_EMAIL || "lokal.utvikler@nav.no";
}
