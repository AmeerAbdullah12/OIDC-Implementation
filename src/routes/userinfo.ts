import { Router, Request, Response } from "express";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { config } from "../config/env";

const router = Router();

// Cache the JWKS fetcher — it handles refetching and caching internally
const JWKS = createRemoteJWKSet(new URL(`${config.issuerUrl}/.well-known/jwks.json`));

router.get("/userinfo", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: config.issuerUrl,
    });

    res.json({
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      iss: payload.iss,
      iat: payload.iat,
      exp: payload.exp,
    });
  } catch (err) {
    // jwtVerify throws on expired, tampered, or incorrectly signed tokens
    res.status(401).json({ error: "invalid_token" });
  }
});

export default router;