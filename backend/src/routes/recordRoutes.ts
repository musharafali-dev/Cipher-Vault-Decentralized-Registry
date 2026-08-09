import { Router } from "express";
import { getRecords, getRecordById, syncRecord } from "../controllers/recordController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getRecords);
router.get("/:onChainId", getRecordById);
router.post("/sync", authenticate, syncRecord);

export default router;
