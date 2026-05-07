interface Client {
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  name: string;
}

// In production this would be a database table
const clients = new Map<string, Client>([
  [
    "test-client",
    {
      clientId: "test-client",
      // In production client secrets would be hashed — never stored in plain text
      clientSecret: "test-secret",
      redirectUris: ["http://localhost:8080/callback"],
      name: "Test Application",
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