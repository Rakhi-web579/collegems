import Results from "../models/Results.model.js";
import Student from "../models/User.model.js";
import Course from "../models/Course.model.js";

export const getResults = async (req, res) => {
    try {
        const { id } = req.user;

        const results = await Results.find({ studentId: id })
            .populate("courseId", "name code")
            .select("grade semester");

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
        const { studentId, courseCode, marks, grade } = req.body;

        // 1️⃣ Find student using studentId
        const student = await Student.findOne({ studentId });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // 2️⃣ Find course using code
        const course = await Course.findOne({ code: courseCode });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // 3️⃣ Save result using Mongo IDs
        const result = await Results.create({
            studentId: student._id,
            courseId: course._id,
            marks,
            grade,
        });

        res.status(201).json(result);
    } catch (err) {
        console.log("Create Result Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const publishResult = async (req, res) => {
    try {
        const result = await Results.findByIdAndUpdate(
            req.params.id,
            { status: "published" },
            { new: true }
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Publish failed" });
    }
};