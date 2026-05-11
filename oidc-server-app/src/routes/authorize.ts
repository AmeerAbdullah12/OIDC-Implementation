import { Router, Request, Response } from "express";
import { getClient, isValidRedirectUri } from "../store/clients";

const router = Router();

router.get("/authorize", (req: Request, res: Response) => {
  const {
    client_id,
    redirect_uri,
    response_type,
    state,
    code_challenge,
    code_challenge_method,
  } = req.query as Record<string, string>;

  if (!client_id || !redirect_uri || !response_type) {
    res.status(400).json({ error: "missing required parameters" });
    return;
  }

  const client = getClient(client_id);
  if (!client) {
    res.status(401).json({ error: "unknown_client" });
    return;
  }

  if (!isValidRedirectUri(client_id, redirect_uri)) {
    res.status(400).json({ error: "invalid_redirect_uri" });
    return;
  }

  if (response_type !== "code") {
    res.status(400).json({ error: "unsupported_response_type" });
    return;
  }

  if (code_challenge && code_challenge_method !== "S256") {
    res.status(400).json({ error: "unsupported_code_challenge_method" });
    return;
  }

  // Store auth request params in session so /login can complete the flow
  // after the user authenticates
  req.session.pendingAuth = {
    clientId: client_id,
    redirectUri: redirect_uri,
    state,
    codeChallenge: code_challenge,
    codeChallengeMethod: code_challenge_method,
  };

  res.redirect("/login");
});

export default router;