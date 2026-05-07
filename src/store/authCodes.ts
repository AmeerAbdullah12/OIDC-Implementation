import crypto from "crypto";

interface AuthCode {
  code: string;
  clientId: string;
  subject: string;
  email: string;
  name: string;
  redirectUri: string;
  expiresAt: number;
}

// In production this would be Redis — codes must be shared across instances
// and must expire automatically
const store = new Map<string, AuthCode>();

export function createAuthCode(data: Omit<AuthCode, "code" | "expiresAt">): string {
  const code = crypto.randomBytes(32).toString("hex");

  store.set(code, {
    ...data,
    code,
    // Auth codes are intentionally short-lived — 10 minutes is the RFC maximum
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  return code;
}

export function consumeAuthCode(code: string): AuthCode | null {
  const entry = store.get(code);

  if (!entry) return null;

  // Codes are single-use — delete immediately after retrieval
  store.delete(code);

  if (Date.now() > entry.expiresAt) return null;

  return entry;
}