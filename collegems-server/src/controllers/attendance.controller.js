import Attendance from "../models/Attendance.model.js";
import User from "../models/User.model.js";
import { logAction } from "../utils/auditService.js";

export const markAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;

    for (const r of records) {
      await Attendance.findOneAndUpdate(
        {
          student: r.studentId,
          date,
        },
        {
          status: r.status,
        },
        { upsert: true, new: true },
      );
    }

    res.json({ message: "Attendance saved" });

    // Log action
    await logAction(req.user.id, "UPDATE_ATTENDANCE", "Attendance", date, { recordsCount: records.length });
  } catch (err) {
    res.status(500).json({ message: "Attendance failed" });
  }
};

export const getMyAttendance = async (req, res) => {
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

    const data = await Attendance.find({
      student: studentId,
    }).populate("course", "name");

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getLowAttendance = async (req, res) => {
  try {
    const threshold = 75; // attendance percentage cutoff

    const result = await Attendance.aggregate([
      {
        $group: {
          _id: { student: "$student", course: "$course" },
          totalClasses: { $sum: 1 },
          presentClasses: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          percentage: {
            $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100],
          },
        },
      },
      {
        $match: { percentage: { $lt: threshold } },
      },
    ]);

    const populated = await Attendance.populate(result, [
      { path: "_id.student", select: "name email rollNumber" },
      { path: "_id.course", select: "name code" },
    ]);

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};