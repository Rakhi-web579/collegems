import User from "../models/User.model.js";
import Course from "../models/Course.model.js";
import Attendance from "../models/Attendance.model.js";
import TeacherAttendance from "../models/TeacherAttendance.js";
import Results from "../models/Results.model.js";
import Leave from "../models/Leave.model.js";
import Assignment from "../models/Assignment.model.js";
import Salary from "../models/Salary.model.js";

// Fetch unique filter values (departments, courses, semesters, users)
export const getFilterOptions = async (req, res) => {
  try {
    // Unique departments from both Course and User models
    const courseDeps = await Course.distinct("department");
    const teacherDeps = await User.distinct("department", { role: "teacher" });
    const departments = Array.from(new Set([...courseDeps, ...teacherDeps])).filter(Boolean);

    // List of courses
    const courses = await Course.find().select("name code department semester");

    // List of semesters
    const semesters = await User.distinct("semester", { role: "student" }).then(sems => 
      sems.filter(Boolean).sort()
    );

    // All active students and teachers for dropdown filters
    const students = await User.find({ role: "student" }).select("name studentId semester course email");
    const teachers = await User.find({ role: "teacher" }).select("name teacherId department email");

    res.json({
      departments,
      courses,
      semesters,
      students,
      teachers,
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ message: "Failed to fetch filter options" });
  }
};

// Generate aggregated report
export const generateReport = async (req, res) => {
  try {
    const { type, userId, department, semester, startDate, endDate } = req.query;

    if (!type || !["student", "teacher"].includes(type)) {
      return res.status(400).json({ message: "Invalid or missing report type" });
    }

    if (type === "student") {
      const studentQuery = { role: "student" };

      if (userId) {
        studentQuery._id = userId;
      }
      if (semester) {
        studentQuery.semester = semester;
      }
      if (department) {
        // Find course name match or exact match on student course field
        studentQuery.course = { $regex: department, $options: "i" };
      }

      const students = await User.find(studentQuery).select(
        "name email phone studentId course semester"
      );

      const reportData = [];

      for (const student of students) {
        // 1. Courses
        const studentCourses = await Course.find({
          $or: [
            { semester: student.semester },
            { department: student.course },
          ]
        }).populate("teacher", "name email");

        // 2. Attendance
        const attQuery = { student: student._id };
        if (startDate || endDate) {
          attQuery.date = {};
          if (startDate) attQuery.date.$gte = startDate;
          if (endDate) attQuery.date.$lte = endDate;
        }
        const attendance = await Attendance.find(attQuery).populate("course", "name code");
        const totalClasses = attendance.length;
        const presentClasses = attendance.filter((a) => a.status === "present").length;
        const absentClasses = totalClasses - presentClasses;
        const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

        // 3. Results (Performance)
        const results = await Results.find({ studentId: student._id }).populate("courseId", "name code department");

        // 4. Leaves
        const leaveQuery = { user: student._id };
        if (startDate || endDate) {
          leaveQuery.startDate = {};
          if (startDate) leaveQuery.startDate.$gte = new Date(startDate);
          if (endDate) leaveQuery.startDate.$lte = new Date(endDate);
        }
        const leaves = await Leave.find(leaveQuery);

        // 5. Academic Details / Assignment Submissions
        const assignments = await Assignment.find({
          "submissions.student": student._id,
        }).populate("course", "name code");

        const submissions = [];
        for (const assign of assignments) {
          const sub = assign.submissions.find(
            (s) => s.student.toString() === student._id.toString()
          );
          if (sub) {
            submissions.push({
              title: assign.title,
              course: assign.course ? assign.course.name : "N/A",
              dueDate: assign.dueDate,
              submittedAt: sub.submittedAt,
              marks: sub.marks,
            });
          }
        }

        reportData.push({
          id: student._id,
          name: student.name,
          email: student.email,
          phone: student.phone || "N/A",
          studentId: student.studentId,
          course: student.course,
          semester: student.semester,
          courses: studentCourses.map((c) => ({
            name: c.name,
            code: c.code,
            teacher: c.teacher ? c.teacher.name : "Unassigned",
          })),
          attendance: {
            total: totalClasses,
            present: presentClasses,
            absent: absentClasses,
            percentage: attendancePercentage,
            records: attendance.map((a) => ({
              date: a.date,
              status: a.status,
              course: a.course ? a.course.name : "N/A",
            })),
          },
          results: results.map((r) => ({
            course: r.courseId ? r.courseId.name : "N/A",
            code: r.courseId ? r.courseId.code : "N/A",
            internalMarks: r.internalMarks || 0,
            externalMarks: r.externalMarks || 0,
            practicalMarks: r.practicalMarks || 0,
            totalMarks: r.totalMarks || 0,
            grade: r.grade || "N/A",
            status: r.status,
          })),
          leaves: leaves.map((l) => ({
            startDate: l.startDate,
            endDate: l.endDate,
            reason: l.reason,
            status: l.status,
            type: l.type,
          })),
          submissions,
        });
      }

      return res.json({ type: "student", data: reportData });
    } else {
      // Teacher reports
      const teacherQuery = { role: "teacher" };

      if (userId) {
        teacherQuery._id = userId;
      }
      if (department) {
        teacherQuery.department = { $regex: department, $options: "i" };
      }

      const teachers = await User.find(teacherQuery).select(
        "name email phone teacherId department"
      );

      const reportData = [];

      for (const teacher of teachers) {
        // 1. Courses taught
        const taughtCourses = await Course.find({ teacher: teacher._id });

        // 2. Attendance
        const attQuery = { teacher: teacher._id };
        if (startDate || endDate) {
          attQuery.date = {};
          if (startDate) attQuery.date.$gte = new Date(startDate);
          if (endDate) attQuery.date.$lte = new Date(endDate);
        }
        const attendance = await TeacherAttendance.find(attQuery);
        const totalDays = attendance.length;
        const presentDays = attendance.filter((a) => a.status === "Present").length;
        const absentDays = attendance.filter((a) => a.status === "Absent").length;
        const lateDays = attendance.filter((a) => a.status === "Late").length;
        // count late as half present
        const attendancePercentage = totalDays > 0 ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100) : 0;

        // 3. Leaves
        const leaveQuery = { user: teacher._id };
        if (startDate || endDate) {
          leaveQuery.startDate = {};
          if (startDate) leaveQuery.startDate.$gte = new Date(startDate);
          if (endDate) leaveQuery.startDate.$lte = new Date(endDate);
        }
        const leaves = await Leave.find(leaveQuery);

        // 4. Salary
        const salaries = await Salary.find({ staff: teacher._id });

        reportData.push({
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone || "N/A",
          teacherId: teacher.teacherId,
          department: teacher.department,
          courses: taughtCourses.map((c) => ({
            name: c.name,
            code: c.code,
            semester: c.semester,
          })),
          attendance: {
            total: totalDays,
            present: presentDays,
            absent: absentDays,
            late: lateDays,
            percentage: attendancePercentage,
            records: attendance.map((a) => ({
              date: a.date,
              status: a.status,
            })),
          },
          leaves: leaves.map((l) => ({
            startDate: l.startDate,
            endDate: l.endDate,
            reason: l.reason,
            status: l.status,
            type: l.type,
          })),
          salaries: salaries.map((s) => ({
            total: s.total,
            paid: s.paid,
            status: s.status,
            dueDate: s.dueDate,
          })),
        });
      }

      return res.json({ type: "teacher", data: reportData });
    }
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};
