import Results from "../models/Results.model.js";
import Student from "../models/User.model.js";
import Course from "../models/Course.model.js";
import { logAction } from "../utils/auditService.js";
import { publishEvent } from "../utils/rabbitmq.js";
import { checkSemesterFrozen } from "../services/semesterService.js";
export const getResults = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

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

        const results = await Results.find({
            studentId: studentId,
            status: "published",
        })
            .populate("courseId", "name code")
            .select("internalMarks externalMarks practicalMarks totalMarks grade status semester createdAt");

        res.json(results);
    } catch (error) {
        console.error("Get Results Error:", error);
        res.status(500).json({
            message: "Failed to fetch results",
        });
    }
};

export const createResult = async (req, res) => {
    try {
        const { studentId, courseId, semester, internalMarks, externalMarks, practicalMarks, totalMarks, grade, status } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        await checkSemesterFrozen(course.semester);

        const result = await Results.create({
            studentId,
            courseId,
            semester,
            internalMarks,
            externalMarks,
            practicalMarks,
            totalMarks,
            grade,
            status: status || "draft",
            createdBy: req.user.id,
        });
        res.status(201).json(result);

        await logAction(req.user.id, "CREATE_RESULT", "Result", result._id, {
            studentId, courseId, semester, internalMarks, externalMarks, practicalMarks, totalMarks, grade, status,
        });
    } catch (err) {
        console.log("Create Result Error:", err);
        if (err.status === 403) return res.status(403).json({ message: err.message });
        res.status(500).json({ message: "Server Error" });
    }
};

export const publishResult = async (req, res) => {
    try {
        const existingResult = await Results.findById(req.params.id).populate("courseId");
        if (!existingResult) return res.status(404).json({ message: "Result not found" });
        
        await checkSemesterFrozen(existingResult.courseId?.semester || existingResult.semester);

        const result = await Results.findByIdAndUpdate(
            req.params.id,
            { status: "published" },
            { new: true, editorId: req.user.id }
        );
        res.json(result);

        // Log result publish
        await logAction(req.user.id, "PUBLISH_RESULT", "Result", result._id, { studentId: result.studentId });
        
        // Publish Domain Event
        publishEvent("academics", "result.published", {
            studentId: result.studentId,
            courseId: result.courseId,
            resultId: result._id,
            timestamp: new Date()
        });
        await Student.findByIdAndUpdate(
          result.studentId,
          { academicRecordLocked: true }
        );
    } catch (error) {
        if (error.status === 403) return res.status(403).json({ message: error.message });
        res.status(500).json({ message: "Publish failed" });
    }
};

export const publishPreview = async (req, res) => {
    try {
        const { courseId, semester } = req.body;

        if (!courseId || !semester) {
            return res.status(400).json({ message: "courseId and semester are required" });
        }

        const course = await Course.findById(courseId).select("name code");
        if (!course) return res.status(404).json({ message: "Course not found" });

        const draftResults = await Results.find({ courseId, semester, status: "draft" })
            .populate("studentId", "name studentId")
            .select("studentId internalMarks externalMarks practicalMarks totalMarks grade");

        const students = draftResults.map((r) => ({
            _id: r._id,
            name: r.studentId?.name || "Unknown",
            studentId: r.studentId?.studentId || "N/A",
            internalMarks: r.internalMarks,
            externalMarks: r.externalMarks,
            practicalMarks: r.practicalMarks,
            totalMarks: r.totalMarks,
            grade: r.grade,
        }));

        res.json({
            course: { name: course.name, code: course.code },
            semester,
            totalStudents: students.length,
            students,
        });
    } catch (error) {
        console.error("Publish Preview Error:", error);
        res.status(500).json({ message: "Failed to generate publish preview" });
    }
};

export const publishAll = async (req, res) => {
    try {
        const { courseId, semester } = req.body;

        if (!courseId || !semester) {
            return res.status(400).json({ message: "courseId and semester are required" });
        }

        const course = await Course.findById(courseId).select("semester");
        if (!course) return res.status(404).json({ message: "Course not found" });

        await checkSemesterFrozen(course.semester || semester);

        const draftResults = await Results.find({ courseId, semester, status: "draft" })
            .populate("studentId", "name studentId");

        if (draftResults.length === 0) {
            return res.status(400).json({ message: "No draft results to publish" });
        }

        const resultIds = draftResults.map((r) => r._id);
        const studentIds = [...new Set(draftResults.map((r) => r.studentId?._id?.toString()).filter(Boolean))];

        await Results.updateMany(
            { _id: { $in: resultIds } },
            { status: "published", editorId: req.user.id }
        );

        await Promise.all(draftResults.map((r) =>
            logAction(req.user.id, "PUBLISH_RESULT", "Result", r._id, {
                studentId: r.studentId?._id,
                courseId: r.courseId,
                semester,
            })
        ));

        draftResults.forEach((r) => {
            publishEvent("academics", "result.published", {
                studentId: r.studentId?._id,
                courseId: r.courseId,
                resultId: r._id,
                timestamp: new Date(),
            });
        });

        if (studentIds.length > 0) {
            await Student.updateMany(
                { _id: { $in: studentIds } },
                { academicRecordLocked: true }
            );
        }

        const published = await Results.find({ _id: { $in: resultIds } })
            .populate("studentId", "name studentId")
            .select("studentId internalMarks externalMarks practicalMarks totalMarks grade status");

        res.json({
            message: `Successfully published ${published.length} result(s)`,
            totalPublished: published.length,
            results: published,
        });
    } catch (error) {
        if (error.status === 403) return res.status(403).json({ message: error.message });
        console.error("Publish All Error:", error);
        res.status(500).json({ message: "Bulk publish failed" });
    }
};