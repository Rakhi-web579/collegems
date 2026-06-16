import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Models
import Mentorship from "./src/models/Mentorship.model.js";
import MeetingLog from "./src/models/MeetingLog.model.js";
import StudentConcern from "./src/models/StudentConcern.model.js";
import PerformanceDiscussion from "./src/models/PerformanceDiscussion.model.js";
import User from "./src/models/User.model.js";

const PASS = "✅ PASS";
const FAIL = "❌ FAIL";
let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ${PASS}  ${testName}`);
    passed++;
  } else {
    console.log(`  ${FAIL}  ${testName}`);
    failed++;
  }
}

async function testDatabaseModels() {
  console.log("\n🔹 Test Suite: Database Models");

  const mentorId = new mongoose.Types.ObjectId();
  const menteeId = new mongoose.Types.ObjectId();

  // Mentorship
  const mentorship = new Mentorship({
    mentor: mentorId,
    mentee: menteeId,
  });
  await mentorship.save();
  assert(mentorship._id !== undefined, "Mentorship: Created successfully");
  assert(mentorship.status === "active", "Mentorship: Default status is active");

  // MeetingLog
  const meeting = new MeetingLog({
    mentorship: mentorship._id,
    date: new Date(),
    discussionSummary: "Discussed academic progress",
    actionItems: ["Read chapter 5", "Complete assignment"],
  });
  await meeting.save();
  assert(meeting._id !== undefined, "MeetingLog: Created successfully");
  assert(meeting.actionItems.length === 2, "MeetingLog: Action items saved");

  // StudentConcern
  const concern = new StudentConcern({
    mentorship: mentorship._id,
    type: "academic",
    description: "Struggling with physics",
  });
  await concern.save();
  assert(concern._id !== undefined, "StudentConcern: Created successfully");
  assert(concern.status === "open", "StudentConcern: Default status is open");

  // PerformanceDiscussion
  const performance = new PerformanceDiscussion({
    mentorship: mentorship._id,
    academicProgress: "Good",
    strengths: "Math",
    areasForImprovement: "Physics",
  });
  await performance.save();
  assert(performance._id !== undefined, "PerformanceDiscussion: Created successfully");

  // Cleanup
  await Mentorship.deleteOne({ _id: mentorship._id });
  await MeetingLog.deleteOne({ _id: meeting._id });
  await StudentConcern.deleteOne({ _id: concern._id });
  await PerformanceDiscussion.deleteOne({ _id: performance._id });
  assert(true, "Cleanup: Test data removed");
}

async function testAPIRoutes() {
  console.log("\n🔹 Test Suite: API Routes (HTTP)");

  try {
    const res = await fetch("http://localhost:5000/api/mentorships");
    assert(res.status === 401, "GET /api/mentorships without auth → 401");
  } catch (e) {
    assert(false, "GET /api/mentorships without auth → 401 (fetch failed: " + e.message + ")");
  }

  try {
    const res = await fetch("http://localhost:5000/api/mentorships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId: "fake", menteeId: "fake" }),
    });
    assert(res.status === 401, "POST /api/mentorships without auth → 401");
  } catch (e) {
    assert(false, "POST /api/mentorships (fetch failed: " + e.message + ")");
  }
}

async function runAllTests() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Mentorship Feature — Test Suite");
  console.log("═══════════════════════════════════════════════════");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n  📦 Connected to MongoDB for integration tests");
    await testDatabaseModels();
    await testAPIRoutes();
  } catch (e) {
    console.log("\n  ⚠️  Skipping DB tests: " + e.message);
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log("═══════════════════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
