import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import {
  runPlagiarismCheck,
  getAssignmentReports,
  getSubmissionReport,
  reviewReport,
} from "../controllers/plagiarism.controller.js";

const router = express.Router();

// Run (or re-run) a plagiarism check across all submissions for an assignment
router.post(
  "/check/:assignmentId",
  protect,
  allowRoles("teacher", "hod"),
  runPlagiarismCheck
);

// Get all reports for an assignment (sorted by similarity desc)
router.get(
  "/assignment/:assignmentId",
  protect,
  allowRoles("teacher", "hod"),
  getAssignmentReports
);

// Get a single student's report for an assignment
router.get(
  "/assignment/:assignmentId/student/:studentId",
  protect,
  allowRoles("teacher", "hod"),
  getSubmissionReport
);

// Mark a report as reviewed / cleared / action taken
router.patch(
  "/report/:id/review",
  protect,
  allowRoles("teacher", "hod"),
  reviewReport
);

export default router;
