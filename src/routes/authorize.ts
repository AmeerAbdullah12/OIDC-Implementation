import { Router, Request, Response } from "express";
import { createAuthCode } from "../store/authCodes";
import { getClient, isValidRedirectUri } from "../store/clients";

const router = Router();

router.get("/authorize", (req: Request, res: Response) => {
  const { client_id, redirect_uri, response_type, state } = req.query as Record<string, string>;

  if (!client_id || !redirect_uri || !response_type) {
    res.status(400).json({ error: "missing required parameters" });
    return;
  }

  const client = getClient(client_id);
  if (!client) {
    res.status(401).json({ error: "unknown_client" });
    return;
  }

  // Redirect URI must exactly match one of the registered URIs —
  // even a trailing slash difference is enough to reject
  if (!isValidRedirectUri(client_id, redirect_uri)) {
    res.status(400).json({ error: "invalid_redirect_uri" });
    return;
  }

  if (response_type !== "code") {
    res.status(400).json({ error: "unsupported_response_type" });
    return;
  }

  const subject = "user-123";
  const email = "john@example.com";
  const name = "John";

  const code = createAuthCode({ clientId: client_id, subject, email, name, redirectUri: redirect_uri });

  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set("code", code);
  if (state) redirectUrl.searchParams.set("state", state);

  res.redirect(redirectUrl.toString());
});

export default router;