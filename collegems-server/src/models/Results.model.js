import mongoose from 'mongoose';

const ResultsSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    grade: {
        type: String,
        required: true,
    },
    semester: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Results = mongoose.model('Results', ResultsSchema);

export default Results;