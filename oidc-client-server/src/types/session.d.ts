import "express-session";

declare module "express-session" {
  interface SessionData {
    accessToken?: string;
    codeVerifier?: string;
    oauthState?: string;
    user?: {
      sub: string;
      email: string;
      name: string;
    };
  }
}