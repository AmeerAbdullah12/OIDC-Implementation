import express, { Application } from "express";
import healthRouter from "./routes/health";
import jwksRouter from "./routes/jwks";
import tokenRouter from "./routes/token";
import discoveryRouter from "./routes/discovery";

export function createApp(): Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(healthRouter);
  app.use(jwksRouter);
  app.use(tokenRouter);
  app.use(discoveryRouter);
  return app;
}