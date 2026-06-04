import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    type: {
      type: String,
      enum: ["Sick", "Casual", "Duty", "Other"],
      default: "Casual",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Leave", leaveSchema);
