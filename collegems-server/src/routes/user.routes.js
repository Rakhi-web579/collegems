import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import User from "../models/User.model.js";
import {
  getMe,
  updateMe,
  updatePassword,
  getPreferences,
  updatePreferences,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", protect, allowRoles("teacher"), getMe);
router.put("/me", protect, allowRoles("teacher"), updateMe);
router.put("/me/password", protect, allowRoles("teacher"), updatePassword);
router.get("/me/preferences", protect, allowRoles("teacher"), getPreferences);
router.put(
  "/me/preferences",
  protect,
  allowRoles("teacher"),
  updatePreferences,
);

// Teacher fetches all students
router.get(
  "/students",
  protect,
  allowRoles("teacher", "hod"),
  async (req, res) => {
    const students = await User.find({ role: "student" }).select("name email");

    res.json(students);
  },
);

router.get("/teachers", protect, async (req, res) => {
  const teachers = await User.find({ role: "teacher" }).select("name email");

  res.json(teachers);
});

export default router;
