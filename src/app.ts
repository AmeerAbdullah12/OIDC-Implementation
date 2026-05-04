import express, { Application } from "express";
import healthRouter from "./routes/health";

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // needed for form POST in OAuth flows

  // Routes
  app.use(healthRouter);

  return app;
}