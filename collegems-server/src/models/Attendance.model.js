import mongoose from "mongoose";
import snapshotPlugin from "../plugins/snapshotPlugin.js";

function isValidDateFormat(dateString) {
    if (!dateString || typeof dateString !== 'string') return false;
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
}

function isValidDateRange(dateString) {
    if (!isValidDateFormat(dateString)) return false;
    
    const date = new Date(dateString);
    const minDate = new Date('2000-01-01');
    const maxDate = new Date('2100-12-31');
    
    return date >= minDate && date <= maxDate;
}

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'Student ID is required']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, 'Course ID is required']
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      validate: {
        validator: function(value) {
          return isValidDateFormat(value) && isValidDateRange(value);
        },
        message: function(props) {
          const value = props.value;
          if (!isValidDateFormat(value)) {
            return 'Date must be in YYYY-MM-DD format (e.g., 2024-01-01)';
          }
          if (!isValidDateRange(value)) {
            return 'Date must be between 2000-01-01 and 2100-12-31';
          }
          return 'Invalid date format';
        }
      }
    },
    status: {
      type: String,
      enum: {
        values: ["present", "absent"],
        message: 'Status must be present or absent'
      },
      required: [true, 'Status is required']
    }
  },
  { timestamps: true }
);

attendanceSchema.index(
  { student: 1, course: 1, date: 1 },
  { unique: true }
);

attendanceSchema.index({ course: 1, date: -1 });
attendanceSchema.index({ student: 1, date: -1 });

attendanceSchema.plugin(snapshotPlugin);

attendanceSchema.statics.getAttendanceByDate = function(courseId, date) {
    return this.find({ course: courseId, date });
};

attendanceSchema.statics.getAttendanceByStudent = function(studentId, startDate, endDate) {
    const query = { student: studentId };
    if (startDate) query.date = { $gte: startDate };
    if (endDate) query.date = { ...query.date, $lte: endDate };
    return this.find(query);
};

attendanceSchema.statics.getAttendanceStats = function(courseId, startDate, endDate) {
    const query = { course: courseId };
    if (startDate) query.date = { $gte: startDate };
    if (endDate) query.date = { ...query.date, $lte: endDate };
    
    return this.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
};

export default mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

export { isValidDateFormat, isValidDateRange };