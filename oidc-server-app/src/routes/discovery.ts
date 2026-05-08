import { Router, Request, Response } from "express";
import { config } from "../config/env";

const router = Router();

router.get("/.well-known/openid-configuration", (_req: Request, res: Response) => {
  // This document tells any OIDC-compliant client everything it needs to know
  // about our server — endpoints, supported algorithms, supported scopes etc.
  // This is what libraries like passport.js or any SSO client fetch first
  res.json({
    issuer: config.issuerUrl,
    authorization_endpoint: `${config.issuerUrl}/authorize`,
    token_endpoint: `${config.issuerUrl}/token`,
    userinfo_endpoint: `${config.issuerUrl}/userinfo`,
    jwks_uri: `${config.issuerUrl}/.well-known/jwks.json`,

    // We only support authorization_code for now — implicit is deprecated in OAuth 2.1
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],

    scopes_supported: ["openid", "email", "profile"],

    // Both methods will be implemented in the auth code flow
    token_endpoint_auth_methods_supported: [
      "client_secret_post",
      "client_secret_basic",
    ],

    claims_supported: ["sub", "iss", "iat", "exp", "email", "name"],
  });
});

export default router;