import { createApp } from "./app";
import { config } from "./config/env";
import { loadKeys } from "./keys/keyManager";

// Keys must be ready before the server accepts any requests
loadKeys();

const app = createApp();

app.listen(config.port, () => {
  console.log(`OIDC Server running on port ${config.port}`);
  console.log(`Issuer:      ${config.issuerUrl}`);
  console.log(`JWKS:        ${config.issuerUrl}/.well-known/jwks.json`);
});