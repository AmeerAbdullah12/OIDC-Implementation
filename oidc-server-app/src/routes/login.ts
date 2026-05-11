import { Router, Request, Response } from "express";
import { findUserByEmail, validatePassword } from "../store/users";
import { createAuthCode } from "../store/authCodes";

const router = Router();

router.get("/login", (req: Request, res: Response) => {
  const error = req.query.error as string | undefined;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Login</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: system-ui, sans-serif;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
          }
          h1 { font-size: 1.5rem; margin-bottom: 1.5rem; }
          label { display: block; font-size: 0.875rem; margin-bottom: 0.25rem; color: #444; }
          input {
            width: 100%;
            padding: 0.625rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            margin-bottom: 1rem;
          }
          button {
            width: 100%;
            padding: 0.625rem;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
          }
          button:hover { background: #1d4ed8; }
          .error {
            background: #fee2e2;
            color: #dc2626;
            padding: 0.75rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            font-size: 0.875rem;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Sign in</h1>
          ${error ? `<div class="error">${error}</div>` : ""}
          <form method="POST" action="/login">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required autofocus />
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required />
            <button type="submit">Continue</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.redirect("/login?error=Email and password are required");
    return;
  }

  const user = await findUserByEmail(email);
  if (!user || !(await validatePassword(user, password))) {
    res.redirect("/login?error=Invalid email or password");
    return;
  }

  const pending = req.session.pendingAuth;
  if (!pending) {
    res.status(400).json({ error: "no pending authorization request" });
    return;
  }

  const code = createAuthCode({
    clientId: pending.clientId,
    subject: user.id,
    email: user.email,
    name: user.name,
    redirectUri: pending.redirectUri,
    codeChallenge: pending.codeChallenge,
    codeChallengeMethod: pending.codeChallengeMethod,
  });

  const redirectUrl = new URL(pending.redirectUri);
  redirectUrl.searchParams.set("code", code);
  if (pending.state) redirectUrl.searchParams.set("state", pending.state);

  delete req.session.pendingAuth;

  res.redirect(redirectUrl.toString());
});

export default router;