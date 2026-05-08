import express, { Application } from "express";
import healthRouter from "./routes/health";
import jwksRouter from "./routes/jwks";
import tokenRouter from "./routes/token";
import discoveryRouter from "./routes/discovery";
import authorizeRouter from "./routes/authorize";
import userinfoRouter from "./routes/userinfo";
import registerRouter from "./routes/register";

export function createApp(): Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(healthRouter);
  app.use(discoveryRouter);
  app.use(jwksRouter);
  app.use(authorizeRouter);
  app.use(tokenRouter);
  app.use(userinfoRouter);
  app.use(registerRouter);

  return app;
}