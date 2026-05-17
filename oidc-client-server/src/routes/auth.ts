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

  const state = crypto.randomBytes(16).toString("hex");

  // Store verifier and state in signed HttpOnly cookies so they
  // survive the redirect chain without relying on session
  res.cookie("code_verifier", codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.nodeEnv === "production",
    maxAge: 10 * 60 * 1000,
  });

  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.nodeEnv === "production",
    maxAge: 10 * 60 * 1000,
  });

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

  if (!code || !state) {
    res.status(400).json({ error: "missing code or state" });
    return;
  }

  const storedState = req.cookies.oauth_state;
  const codeVerifier = req.cookies.code_verifier;

  if (!storedState || state !== storedState) {
    res.status(400).json({ error: "invalid state" });
    return;
  }

  if (!codeVerifier) {
    res.status(400).json({ error: "missing code verifier" });
    return;
  }

  // Clear the temporary cookies
  res.clearCookie("code_verifier");
  res.clearCookie("oauth_state");

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

  req.session.save((err) => {
    if (err) {
      res.status(500).json({ error: "session save failed" });
      return;
    }
    res.redirect("http://localhost:5173/dashboard");
  });
});

export default router;