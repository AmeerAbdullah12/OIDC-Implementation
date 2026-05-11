import crypto from "crypto";

interface Client {
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  name: string;
}

const clients = new Map<string, Client>([
  [
    "oidc-client",
    {
      clientId: "oidc-client",
      clientSecret: "oidc-client-secret",
      redirectUris: ["http://localhost:8080/callback"],
      name: "OIDC Client App",
    },
  ],
]);

export function getClient(clientId: string): Client | null {
  return clients.get(clientId) ?? null;
}

export function validateClient(clientId: string, clientSecret: string): Client | null {
  const client = clients.get(clientId);
  if (!client) return null;
  if (client.clientSecret !== clientSecret) return null;
  return client;
}

export function isValidRedirectUri(clientId: string, redirectUri: string): boolean {
  const client = clients.get(clientId);
  if (!client) return false;
  return client.redirectUris.includes(redirectUri);
}