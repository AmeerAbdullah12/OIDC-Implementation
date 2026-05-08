import { Router, Request, Response } from "express";
import { getJWK } from "../keys/keyManager";

const router = Router();

router.get("/.well-known/jwks.json", (_req: Request, res: Response) => {
  // keys is an array to support multiple keys during rotation —
  // old key stays in the array until all tokens signed with it have expired
  res.json({
    keys: [getJWK()],
  }); 
});

export default router;