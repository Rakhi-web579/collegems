// ─── FILE: collegems-server/src/controllers/assignment.controller.js ──────────
// WHAT CHANGED: Added getUpcomingAssignments() at the bottom.
// Everything above this is YOUR ORIGINAL CODE — do not touch it.
// ─────────────────────────────────────────────────────────────────────────────

import Assignment from "../models/Assignment.model.js";
import mongoose from "mongoose";

export const createAssignment = async (req, res) => {
  try {
    const { title, courseId, dueDate, description, submissionType } = req.body;
    const totalPointsRaw =
      req.body.totalPoints !== undefined
        ? req.body.totalPoints
        : req.body.maxMarks;

    if (!title || !courseId || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const totalPoints =
      totalPointsRaw !== undefined && totalPointsRaw !== ""
        ? Number(totalPointsRaw)
        : undefined;

    if (totalPointsRaw !== undefined && Number.isNaN(totalPoints)) {
      return res.status(400).json({ message: "Invalid total points" });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      teacher: req.user.id,
      dueDate,
      totalPoints,
      submissionType: submissionType || "file",
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Create Assignment Error:", error);
    res.status(500).json({ message: "Failed to create assignment" });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const alreadySubmitted = assignment.submissions.some(
      (s) => s.student.toString() === req.user.id
    );
    if (alreadySubmitted) {
      return res.status(400).json({ message: "Assignment already submitted" });
    }

    const submissionType = assignment.submissionType || "file";
    const textResponse =
      typeof req.body.textResponse === "string" ? req.body.textResponse.trim() : "";
    const link = typeof req.body.link === "string" ? req.body.link.trim() : "";
    const hasFile = Boolean(req.file);
    const hasText = Boolean(textResponse);
    const hasLink = Boolean(link);

    if (submissionType === "file" && !hasFile)
      return res.status(400).json({ message: "File is required" });
    if (submissionType === "text" && !hasText)
      return res.status(400).json({ message: "Text response is required" });
    if (submissionType === "link" && !hasLink)
      return res.status(400).json({ message: "Link is required" });
    if (submissionType === "both" && (!hasFile || !hasText))
      return res.status(400).json({ message: "File and text response are required" });

    if (hasLink) {
      try {
        const parsed = new URL(link);
        if (!/^https?:$/.test(parsed.protocol)) {
          return res.status(400).json({ message: "Invalid link" });
        }
      } catch {
        return res.status(400).json({ message: "Invalid link" });
      }
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const submission = {
      student: req.user.id,
      submittedAt: new Date(),
      status: "submitted",
      textResponse: hasText ? textResponse : undefined,
      link: hasLink ? link : undefined,
      file: req.file
        ? {
            url: `${baseUrl}/uploads/assignments/${req.file.filename}`,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            filename: req.file.filename,
          }
        : undefined,
    };

    assignment.submissions.push(submission);
    await assignment.save();
    res.json({ message: "Assignment submitted", submission });
  } catch (error) {
    console.error("Submit Assignment Error:", error);
    res.status(500).json({ message: "Submission failed" });
  }
};

export const evaluateAssignment = async (req, res) => {
  try {
    const { studentId, marks } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const submission = assignment.submissions.find(
      (s) => s.student.toString() === studentId
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.marks = marks;
    submission.status = "graded";
    await assignment.save();
    res.json({ message: "Assignment evaluated" });
  } catch (error) {
    console.error("Evaluate Assignment Error:", error);
    res.status(500).json({ message: "Evaluation failed" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW FUNCTION — Add this to the bottom of your existing controller
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/assignment/reminders
 * Returns all assignments for the logged-in student with deadline status:
 *   - overdue   : dueDate is in the past, student hasn't submitted
 *   - dueToday  : dueDate is today, student hasn't submitted
 *   - upcoming  : dueDate is within the next 2 days, student hasn't submitted
 *   - submitted : student already submitted (any dueDate)
 *
 * Only assignments that need the student's attention are returned
 * (overdue, dueToday, upcoming, submitted within the last 7 days).
 */
export const getUpcomingAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch all assignments and populate course name
    const all = await Assignment.find()
      .populate("course", "name code")
      .populate("teacher", "name")
      .lean();

    const now = new Date();
    // Start of today (midnight)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // End of today
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    // 2 days from now
    const twoDaysLater = new Date(todayStart.getTime() + 2 * 24 * 60 * 60 * 1000);
    // 7 days ago (to show recently submitted)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const results = [];

    for (const assignment of all) {
      const due = new Date(assignment.dueDate);
      // const mySubmission = assignment.submissions.find(
      //   (s) => s.student.toString() === studentId
      // );
const mySubmission = (assignment.submissions || []).find(
  (s) => s.student.toString() === studentId
);
      let status;

      if (mySubmission) {
        // Only include submitted ones if submitted recently (last 7 days)
        if (new Date(mySubmission.submittedAt) >= sevenDaysAgo) {
          status = "submitted";
        } else {
          continue; // old submission — skip
        }
      } else if (due < todayStart) {
        status = "overdue";
      } else if (due >= todayStart && due < todayEnd) {
        status = "dueToday";
      } else if (due >= todayEnd && due <= twoDaysLater) {
        status = "upcoming";
      } else {
        continue; // due date too far in the future — skip
      }

      results.push({
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        totalPoints: assignment.totalPoints,
        course: assignment.course,
        teacher: assignment.teacher,
        submissionType: assignment.submissionType,
        status,
        submittedAt: mySubmission?.submittedAt || null,
        marks: mySubmission?.marks || null,
      });
    }

    // Sort: overdue → dueToday → upcoming → submitted
    const ORDER = { overdue: 0, dueToday: 1, upcoming: 2, submitted: 3 };
    results.sort((a, b) => ORDER[a.status] - ORDER[b.status]);

    res.json(results);
  } catch (error) {
    console.error("GetUpcomingAssignments Error:", error);
    res.status(500).json({ message: "Failed to fetch assignment reminders" });
  }
};
