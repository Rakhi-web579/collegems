import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.model.js";
import Notification from "./src/models/Notification.model.js";

dotenv.config();

const trigger = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const student = await User.findOne({ email: "alice.johnson@college.edu" });
    if (!student) {
      console.log("Student not found. Have you run 'npm run seed'?");
      process.exit(1);
    }

    const notification = await Notification.create({
      recipient: student._id,
      type: "assignment",
      message: "New Assignment: Socket Programming Project has been uploaded by Dr. David Evans.",
    });

    console.log("Notification created in the database!");
    console.log("Please restart your backend server if it's running so it processes changes, or just refresh your browser to see the new notification.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

trigger();
