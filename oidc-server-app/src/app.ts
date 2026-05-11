import express, { Application } from "express";
import session from "express-session";
import healthRouter from "./routes/health";
import jwksRouter from "./routes/jwks";
import tokenRouter from "./routes/token";
import discoveryRouter from "./routes/discovery";
import authorizeRouter from "./routes/authorize";
import userinfoRouter from "./routes/userinfo";
import registerRouter from "./routes/register";
import loginRouter from "./routes/login";
import { config } from "./config/env";

export function createApp(): Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        maxAge: 10 * 60 * 1000,
      },
    })
  );

  app.use(healthRouter);
  app.use(discoveryRouter);
  app.use(jwksRouter);
  app.use(authorizeRouter);
  app.use(tokenRouter);
  app.use(userinfoRouter);
  app.use(registerRouter);
  app.use(loginRouter);

  return app;
}