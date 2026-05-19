# OIDC Server Implementation

A production-standard OpenID Connect (OIDC) server built from scratch, with a BFF (Backend For Frontend) and a React client. The goal of this project is to understand how authentication systems like Google SSO actually work under the hood — and to build one.

---

## What is OIDC?

OpenID Connect is a standard built on top of OAuth 2.0. It defines how an authentication server issues identity tokens, how clients verify them, and how the whole SSO (Single Sign-On) flow works.

When you click "Login with Google" on any website, that website is an OIDC client. Google is the OIDC server. This project implements both sides.

---

## Architecture

```
oidc-server-app/        Auth server (port 3000)
oidc-client-server/     BFF — Backend For Frontend (port 8080)
oidc-client/            React app (port 5173)
```

The three pieces have clearly separated responsibilities:

- **oidc-server-app** handles all authentication. It owns user credentials, signs tokens, and exposes standard OIDC endpoints.
- **oidc-client-server** is a thin Express server that sits between React and the auth server. It holds the `client_secret`, exchanges auth codes for tokens, and stores tokens in a server-side session. The React app never sees the token.
- **oidc-client** is the React frontend. It redirects the user to the auth server for login and displays user info returned by the BFF.

---

## The Full Login Flow

```
1.  User clicks "Login" on the React app
2.  React redirects the browser to BFF /login
3.  BFF generates a PKCE code_verifier and code_challenge
4.  BFF stores code_verifier in a signed HttpOnly cookie
5.  BFF redirects the browser to oidc-server /authorize
6.  oidc-server validates the client_id and redirect_uri
7.  oidc-server stores the auth request in session and redirects to /login
8.  User enters credentials on the oidc-server login page
9.  oidc-server verifies credentials, generates a short-lived auth code
10. oidc-server redirects browser to BFF /callback?code=...&state=...
11. BFF reads code_verifier from the signed cookie
12. BFF sends code + code_verifier + client_secret to oidc-server /token (server to server)
13. oidc-server verifies everything and returns a signed JWT
14. BFF stores the JWT in a server-side session — never sent to the browser
15. BFF redirects to React /dashboard
16. React calls BFF /me
17. BFF reads token from session, calls oidc-server /userinfo, returns safe fields to React
```

---

## Why Not Just Return the Token Directly?

The auth code flow exists because the redirect back to the client happens in the browser — meaning a token in the URL would be exposed in browser history, server logs, and referrer headers.

The short-lived auth code is useless alone. It must be exchanged server-to-server with the `client_secret`, which proves the request is coming from the legitimate registered client. The actual token never touches the browser.

---

## Key Concepts Implemented

### Asymmetric Signing (RS256)

Tokens are signed with a private RSA key that only the auth server holds. Any service that needs to verify a token fetches the public key from the JWKS endpoint and verifies the signature — without ever needing the private key.

```
Private key  →  signs tokens       (auth server only)
Public key   →  verifies tokens    (anyone can fetch it)
```

### JWKS Endpoint

```
GET /.well-known/jwks.json
```

Returns the public key in a standardized JSON format. Any OIDC-compliant library can fetch this and verify tokens automatically. The `keys` array supports multiple keys simultaneously for zero-downtime key rotation.

### Discovery Document

```
GET /.well-known/openid-configuration
```

A standardized document that advertises all the auth server's endpoints and capabilities. This is the first thing any OIDC client fetches — it points to the token endpoint, userinfo endpoint, JWKS URI, and more.

### PKCE (Proof Key for Code Exchange)

Prevents auth code interception attacks. The client generates a random `code_verifier`, hashes it into a `code_challenge`, and sends the challenge upfront. During the token exchange it proves it knows the original verifier. This means even if someone intercepts the auth code, they cannot exchange it without the verifier.

### Client Registration

Every application that uses this auth server must be registered with a `client_id`, `client_secret`, and a whitelist of allowed `redirect_uris`. An unregistered client or mismatched redirect URI is rejected before any login happens.

---

## Endpoints

### oidc-server-app (port 3000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/.well-known/openid-configuration` | Discovery document |
| `GET` | `/.well-known/jwks.json` | Public keys for token verification |
| `GET` | `/authorize` | Starts the auth flow, redirects to /login |
| `GET` | `/login` | Login page |
| `POST` | `/login` | Validates credentials, issues auth code |
| `POST` | `/token` | Exchanges auth code for JWT |
| `GET` | `/userinfo` | Returns user claims from a valid token |
| `POST` | `/register` | Creates a new user account |
| `GET` | `/health` | Health check |

### oidc-client-server (port 8080)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/login` | Builds PKCE params, redirects to oidc-server |
| `GET` | `/callback` | Receives auth code, exchanges for token |
| `GET` | `/me` | Returns user info to the React app |
| `POST` | `/logout` | Destroys the session |

---

## Security Decisions

- Passwords are hashed with `bcrypt` (12 rounds) — never stored in plain text
- The `client_secret` lives in `.env` and never leaves the BFF server
- Tokens are stored in server-side sessions — the browser only holds a session cookie
- Session cookies are `httpOnly` and `sameSite: lax` — not accessible via JavaScript
- PKCE state and code verifier are stored in signed `httpOnly` cookies — tamper-proof
- Private keys are gitignored and auto-generated in development, must be pre-provisioned in production
- Auth codes are single-use and expire after 10 minutes

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

Clone the repo and set up each app:

```bash
# Auth server
cd oidc-server-app
npm install
cp .env.example .env
# fill in SESSION_SECRET and ISSUER_URL in .env

# BFF
cd ../oidc-client-server
npm install
cp .env.example .env
# fill in SESSION_SECRET in .env

# React client
cd ../oidc-client
npm install
```

### Run

Open three terminals:

```bash
# Terminal 1
cd oidc-server-app && npm run dev

# Terminal 2
cd oidc-client-server && npm run dev

# Terminal 3
cd oidc-client && npm run dev
```

Visit `http://localhost:5173`.

### Register a user

```bash
POST http://localhost:3000/register
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "yourpassword",
  "name": "Your Name"
}
```

Then log in through the React app.

---

## Project Structure

```
oidc-server-app/
├── src/
│   ├── config/env.ts
│   ├── keys/keyManager.ts
│   ├── routes/
│   │   ├── authorize.ts
│   │   ├── discovery.ts
│   │   ├── health.ts
│   │   ├── jwks.ts
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── token.ts
│   │   └── userinfo.ts
│   ├── store/
│   │   ├── authCodes.ts
│   │   ├── clients.ts
│   │   └── users.ts
│   ├── app.ts
│   └── server.ts

oidc-client-server/
├── src/
│   ├── config/env.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── logout.ts
│   │   └── me.ts
│   ├── types/session.d.ts
│   ├── app.ts
│   └── server.ts

oidc-client/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
```