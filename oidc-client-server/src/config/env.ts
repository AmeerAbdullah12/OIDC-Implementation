import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? "8080", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  oidcIssuer: requireEnv("OIDC_ISSUER"),
  oidcClientId: requireEnv("OIDC_CLIENT_ID"),
  oidcClientSecret: requireEnv("OIDC_CLIENT_SECRET"),
  oidcRedirectUri: requireEnv("OIDC_REDIRECT_URI"),
  sessionSecret: requireEnv("SESSION_SECRET"),
} as const;