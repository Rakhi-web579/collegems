import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import Fee from "../models/Fee.model.js";

const router = express.Router();

// hod sets fee of students
router.post("/set", protect, allowRoles("hod"), async (req, res) => {
  try {
    const { student, total, dueDate } = req.body;

    if (!student || !total || !dueDate) {
      return res.status(400).json({
        message: "Student, total amount and due date are required",
      });
    }

    const existingFee = await Fee.findOne({ student });

    if (existingFee) {
      return res.status(400).json({
        message: "Fee already exists for this student",
      });
    }

    const fee = await Fee.create({
      student,
      total,
      dueDate,
    });

    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// installment pay
router.post("/pay", protect, allowRoles("student", "parent"), async (req, res) => {
  try {
    const { amount } = req.body;
    let studentId = req.user.id;
    if (req.user.role === "parent") {
      const User = (await import("../models/User.model.js")).default;
      const parentUser = await User.findById(req.user.id);
      if (!parentUser || !parentUser.studentId) {
        return res.status(400).json({ message: "No child linked to this parent account" });
      }
      const studentUser = await User.findOne({ studentId: parentUser.studentId, role: "student" });
      if (!studentUser) {
        return res.status(404).json({ message: "Linked student not found" });
      }
      studentId = studentUser._id;
    }

    const fee = await Fee.findOne({ student: studentId });

    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    fee.installments.push({ amount });
    fee.paid += amount;

    await fee.save();

    res.json({ message: "Payment successful", fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Student views own fee

router.get("/me", protect, allowRoles("student", "parent"), async (req, res) => {
  try {
    let studentId = req.user.id;
    if (req.user.role === "parent") {
      const User = (await import("../models/User.model.js")).default;
      const parentUser = await User.findById(req.user.id);
      if (!parentUser || !parentUser.studentId) {
        return res.status(400).json({ message: "No child linked to this parent account" });
      }
      const studentUser = await User.findOne({ studentId: parentUser.studentId, role: "student" });
      if (!studentUser) {
        return res.status(404).json({ message: "Linked student not found" });
      }
      studentId = studentUser._id;
    }

    const fee = await Fee.findOne({ student: studentId });

    if (!fee) {
      return res.status(404).json({
        message: "No fee record found",
      });
    }

    res.status(200).json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher/hod views all student fees
router.get(
  "/all",
  protect,
  allowRoles("teacher", "hod"),
  async (req, res) => {
    try {
      const fees = await Fee.find().populate("student", "name email");
      res.json(fees);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);
export default router;
