import { Router, Request, Response } from "express";
import { createAuthCode } from "../store/authCodes";

const router = Router();

router.get("/authorize", (req: Request, res: Response) => {
  const { client_id, redirect_uri, response_type, state } = req.query as Record<string, string>;

  if (!client_id || !redirect_uri || !response_type) {
    res.status(400).json({ error: "missing required parameters" });
    return;
  }

  if (response_type !== "code") {
    res.status(400).json({ error: "unsupported_response_type" });
    return;
  }

  // In a real server this would show a login page — for now we simulate
  // an already-authenticated user so we can test the full code exchange flow
  const subject = "user-123";
  const email = "john@example.com";
  const name = "John";

  const code = createAuthCode({ clientId: client_id, subject, email, name, redirectUri: redirect_uri });

  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set("code", code);

  // state must be passed back unchanged so the client can verify it
  // and protect against CSRF attacks
  if (state) redirectUrl.searchParams.set("state", state);

  res.redirect(redirectUrl.toString());
});

export default router;