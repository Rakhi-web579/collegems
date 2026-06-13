import express from "express";
import {
  createStudyGroup,
  getStudyGroups,
  joinStudyGroup,
  getChatHistory,
} from "../controllers/studyGroup.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

router.post("/", createStudyGroup);
router.get("/", getStudyGroups);
router.post("/:id/join", joinStudyGroup);
router.get("/:id/messages", getChatHistory);

export default router;
