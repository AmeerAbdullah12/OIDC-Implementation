import { Router, Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";
import { config } from "../config/env";

const router = Router();

router.get("/login", (req: Request, res: Response) => {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  req.session.codeVerifier = codeVerifier;

  const state = crypto.randomBytes(16).toString("hex");
  req.session.oauthState = state;

  const authUrl = new URL(`${config.oidcIssuer}/authorize`);
  authUrl.searchParams.set("client_id", config.oidcClientId);
  authUrl.searchParams.set("redirect_uri", config.oidcRedirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", state);

  res.redirect(authUrl.toString());
});

router.get("/callback", async (req: Request, res: Response) => {
  const { code, state } = req.query as Record<string, string>;

  if (!code) {
    res.status(400).json({ error: "missing code" });
    return;
  }

  if (state !== req.session.oauthState) {
    res.status(400).json({ error: "invalid state" });
    return;
  }

  const codeVerifier = req.session.codeVerifier;
  if (!codeVerifier) {
    res.status(400).json({ error: "missing code verifier" });
    return;
  }

  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code");
  params.set("code", code);
  params.set("redirect_uri", config.oidcRedirectUri);
  params.set("client_id", config.oidcClientId);
  params.set("client_secret", config.oidcClientSecret);
  params.set("code_verifier", codeVerifier);

  const response = await axios.post(
    `${config.oidcIssuer}/token`,
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const { access_token } = response.data;

  req.session.accessToken = access_token;

  delete req.session.codeVerifier;
  delete req.session.oauthState;

  res.redirect("http://localhost:5173/dashboard");
});

export default router;