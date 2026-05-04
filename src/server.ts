import { createApp } from "./app";
import { config } from "./config/env";

const app = createApp();

app.listen(config.port, () => {
  console.log(`OIDC Server running on port ${config.port}`);
  console.log(`Issuer: ${config.issuerUrl}`);
  console.log(`Environment: ${config.nodeEnv}`);
});