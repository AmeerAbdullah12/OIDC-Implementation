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
  port: parseInt(process.env.PORT ?? "3000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  issuerUrl: requireEnv("ISSUER_URL"),
  privateKeyPath: process.env.PRIVATE_KEY_PATH ?? "./keys/private.pem",
  publicKeyPath: process.env.PUBLIC_KEY_PATH ?? "./keys/public.pem",
} as const;