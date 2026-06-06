import Attendance from "../models/Attendance.model.js";

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
  } catch (err) {
    res.status(500).json({ message: "Attendance failed" });
  }
};

export const getMyAttendance = async (req, res) => {
  const data = await Attendance.find({
    student: req.user.id,
  }).populate("course", "name");

  res.json(data);
};

export const getLowAttendance = async (req, res) => {
  try {
    const aggregateData = await Attendance.aggregate([
      {
        $group: {
          _id: "$student",
          totalClasses: { $sum: 1 },
          presentClasses: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          student: "$_id",
          totalClasses: 1,
          presentClasses: 1,
          percentage: {
            $multiply: [
              { $divide: ["$presentClasses", "$totalClasses"] },
              100
            ]
          }
        }
      },
      {
        $match: {
          percentage: { $lt: 75 },
          totalClasses: { $gt: 0 }
        }
      }
    ]);

    await Attendance.populate(aggregateData, {
      path: "student",
      model: "User",
      select: "name email studentId course semester"
    });

    res.json(aggregateData);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch low attendance data" });
  }
};
