import "express-session";

declare module "express-session" {
  interface SessionData {
    pendingAuth?: {
      clientId: string;
      redirectUri: string;
      state?: string;
      codeChallenge?: string;
      codeChallengeMethod?: string;
    };
  }
}