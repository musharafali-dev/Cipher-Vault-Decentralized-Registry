import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/profile", authenticate, getProfile);
router.get("/profile/:address", getProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
