import mongoose from "mongoose";

const ResultsSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },

    semester: {
        type: String,
        required: true,
    },

    internalMarks: Number,
    externalMarks: Number,
    practicalMarks: Number,

    totalMarks: Number,

    grade: {
        type: String,
    },

    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
    }

}, { timestamps: true });

export default mongoose.model("Results", ResultsSchema);