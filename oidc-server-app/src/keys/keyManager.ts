import { generateKeyPairSync, createPublicKey } from "crypto";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { config } from "../config/env";

export interface JWK {
  kty: string;
  use: string;
  alg: string;
  kid: string;
  n: string;
  e: string;
}

let cachedPrivateKey: string | null = null;
let cachedJWK: JWK | null = null;

const KEY_ID = "oidc-server-key-v1";

function ensureDirectoryExists(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function generateAndSaveKeyPair(): void {
  console.log("No key pair found — generating new RSA-2048 key pair...");

  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  ensureDirectoryExists(config.privateKeyPath);
  ensureDirectoryExists(config.publicKeyPath);

  // mode 0o600 = only the owner process can read the private key
  writeFileSync(config.privateKeyPath, privateKey, { mode: 0o600 });
  writeFileSync(config.publicKeyPath, publicKey, { mode: 0o644 });
}

function pemToJWK(publicKeyPem: string): JWK {
  const publicKey = createPublicKey(publicKeyPem);

  // Node's built-in export gives us base64url-encoded n and e directly
  const jwk = publicKey.export({ format: "jwk" }) as {
    kty: string;
    n: string;
    e: string;
  };

  return {
    kty: jwk.kty,
    use: "sig",
    alg: "RS256",
    kid: KEY_ID,
    n: jwk.n,
    e: jwk.e,
  };
}

export function loadKeys(): void {
  if (!existsSync(config.privateKeyPath) || !existsSync(config.publicKeyPath)) {
    // In production, keys must be pre-provisioned — never auto-generated
    if (config.nodeEnv === "production") {
      throw new Error(
        `Key files not found. Expected private key at: ${config.privateKeyPath}`
      );
    }
    generateAndSaveKeyPair();
  }

  cachedPrivateKey = readFileSync(config.privateKeyPath, "utf-8");
  const publicKeyPem = readFileSync(config.publicKeyPath, "utf-8");
  cachedJWK = pemToJWK(publicKeyPem);

  console.log(`Keys loaded (kid: ${KEY_ID})`);
}

export function getPrivateKey(): string {
  if (!cachedPrivateKey) throw new Error("Keys not loaded. Call loadKeys() at startup.");
  return cachedPrivateKey;
}

export function getJWK(): JWK {
  if (!cachedJWK) throw new Error("Keys not loaded. Call loadKeys() at startup.");
  return cachedJWK;
}