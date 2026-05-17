import express, { Application } from "express";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/env";
import authRouter from "./routes/auth";
import meRouter from "./routes/me";
import logoutRouter from "./routes/logout";

export function createApp(): Application {
  const app = express();

  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      },
    })
  );

  app.use(authRouter);
  app.use(meRouter);
  app.use(logoutRouter);

  return app;
}