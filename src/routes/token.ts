import { Router, Request, Response } from "express";
import { SignJWT, importPKCS8 } from "jose";
import { getPrivateKey } from "../keys/keyManager";
import { consumeAuthCode } from "../store/authCodes";
import { validateClient } from "../store/clients";
import { config } from "../config/env";

const router = Router();

async function signToken(payload: Record<string, string>, subject: string): Promise<string> {
  const privateKey = await importPKCS8(getPrivateKey(), "RS256");

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", kid: "oidc-server-key-v1" })
    .setIssuer(config.issuerUrl)
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);
}

router.post("/token", async (req: Request, res: Response) => {
  const { grant_type, code, redirect_uri, client_id, client_secret } = req.body;

  if (grant_type !== "authorization_code") {
    res.status(400).json({ error: "unsupported_grant_type" });
    return;
  }

  if (!code || !redirect_uri || !client_id || !client_secret) {
    res.status(400).json({ error: "missing required parameters" });
    return;
  }

  // Client secret is validated here — this is the back-channel handshake
  // that proves the token request is coming from the legitimate client
  const client = validateClient(client_id, client_secret);
  if (!client) {
    res.status(401).json({ error: "invalid_client" });
    return;
  }

  const authCode = consumeAuthCode(code);
  if (!authCode) {
    res.status(400).json({ error: "invalid_or_expired_code" });
    return;
  }

  if (authCode.clientId !== client_id) {
    res.status(400).json({ error: "client_id mismatch" });
    return;
  }

  if (authCode.redirectUri !== redirect_uri) {
    res.status(400).json({ error: "redirect_uri mismatch" });
    return;
  }

  const token = await signToken(
    { email: authCode.email, name: authCode.name },
    authCode.subject
  );

  res.json({ access_token: token, token_type: "Bearer", expires_in: 3600 });
});

export default router;