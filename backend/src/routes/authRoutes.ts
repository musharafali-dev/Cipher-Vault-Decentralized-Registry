import { Router } from "express";
import { getNonce, verifySignature } from "../controllers/authController";

const router = Router();

router.get("/nonce", getNonce);
router.post("/nonce", getNonce);
router.post("/verify-signature", verifySignature);

export default router;
