import { Router, Request, Response } from "express";
import { SignJWT, importPKCS8 } from "jose";
import { getPrivateKey } from "../keys/keyManager";
import { config } from "../config/env";

const router = Router();

router.post("/token", async (req: Request, res: Response) => {
  const { subject, email, name } = req.body;

  if (!subject) {
    res.status(400).json({ error: "subject is required" });
    return;
  }

  const privateKeyPem = getPrivateKey();

  // importPKCS8 converts our PEM string into a format jose can use for signing
  const privateKey = await importPKCS8(privateKeyPem, "RS256");

  const token = await new SignJWT({
    email,
    name,
  })
    .setProtectedHeader({
      alg: "RS256",
      // kid tells the verifier which key to fetch from JWKS to verify this token
      kid: "oidc-server-key-v1",
    })
    .setIssuer(config.issuerUrl)
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  res.json({ access_token: token, token_type: "Bearer", expires_in: 3600 });
});

export default router;