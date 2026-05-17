import express, { Application } from "express";
import session from "express-session";
import { config } from "./config/env";
import authRouter from "./routes/auth";
import meRouter from "./routes/me";
import logoutRouter from "./routes/logout";

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
        maxAge: 60 * 60 * 1000,
      },
    })
  );

  app.use(authRouter);
  app.use(meRouter);
  app.use(logoutRouter);

  return app;
}