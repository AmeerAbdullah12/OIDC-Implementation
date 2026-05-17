import { Router, Request, Response } from "express";

const router = Router();

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "failed to logout" });
      return;
    }
    res.json({ success: true });
  });
});

export default router;