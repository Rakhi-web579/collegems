import express from "express";
import { getOwnershipInfo, transferOwnership } from "../controllers/ownership.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/info/:modelName/:recordId", getOwnershipInfo);
router.post("/transfer", transferOwnership);

export default router;
