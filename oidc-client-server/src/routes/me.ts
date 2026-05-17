import { Router, Request, Response } from "express";
import axios from "axios";
import { config } from "../config/env";

const router = Router();

router.get("/me", async (req: Request, res: Response) => {
  const accessToken = req.session.accessToken;

  if (!accessToken) {
    res.status(401).json({ error: "not authenticated" });
    return;
  }

  const response = await axios.get(`${config.oidcIssuer}/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // Only forward safe fields to the React app — never the raw token
  const { sub, email, name } = response.data;

  res.json({ sub, email, name });
});

export default router;