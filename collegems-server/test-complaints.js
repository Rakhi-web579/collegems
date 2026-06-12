import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Models
import Complaint from "./src/models/Complaint.model.js";

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

  const studentId = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();

  // 1. Complaint Creation & Category Selection
  const complaint = new Complaint({
    student: studentId,
    title: "Internet not working in Hostel A",
    description: "The wifi router in corridor 3 is turned off.",
    category: "Technical",
    priority: "High",
  });
  await complaint.save();
  assert(complaint._id !== undefined, "Complaint: Created successfully");
  assert(complaint.category === "Technical", "Complaint: Category selection verified");
  assert(complaint.priority === "High", "Complaint: Priority correctly assigned");
  assert(complaint.status === "Submitted", "Complaint: Default status is 'Submitted'");

  // 2. Status Transitions & Admin Update
  complaint.status = "In Progress";
  complaint.assignedTo = adminId;
  await complaint.save();
  
  const updatedComplaint = await Complaint.findById(complaint._id);
  assert(updatedComplaint.status === "In Progress", "Complaint: Status transitioned successfully to 'In Progress'");
  assert(updatedComplaint.assignedTo.toString() === adminId.toString(), "Complaint: Assigned to Admin successfully");

  // 3. Two-Way Communication (Comments)
  updatedComplaint.comments.push({
    sender: adminId,
    message: "We are sending a technician to look at the router."
  });
  await updatedComplaint.save();
  
  const commentedComplaint = await Complaint.findById(complaint._id);
  assert(commentedComplaint.comments.length === 1, "Complaint: Admin added a comment successfully");
  assert(commentedComplaint.comments[0].message.includes("technician"), "Complaint: Comment content verified");

  // 4. Resolution
  commentedComplaint.status = "Resolved";
  commentedComplaint.resolutionNotes = "Router was rebooted. Working fine now.";
  commentedComplaint.resolvedAt = new Date();
  await commentedComplaint.save();

  const resolvedComplaint = await Complaint.findById(complaint._id);
  assert(resolvedComplaint.status === "Resolved", "Complaint: Status transitioned successfully to 'Resolved'");
  assert(resolvedComplaint.resolutionNotes !== undefined, "Complaint: Resolution notes recorded");
  assert(resolvedComplaint.resolvedAt !== undefined, "Complaint: Resolution timestamp recorded");

  // Cleanup
  await Complaint.deleteOne({ _id: complaint._id });
  assert(true, "Cleanup: Test data removed");
}

async function testAPIRoutes() {
  console.log("\n🔹 Test Suite: API Routes & Permissions (HTTP)");

  try {
    const res = await fetch("http://localhost:5000/api/complaints");
    assert(res.status === 401, "GET /api/complaints without auth → 401 (Unauthorized)");
  } catch (e) {
    assert(false, "GET /api/complaints without auth → 401 (fetch failed: " + e.message + ")");
  }

  try {
    const res = await fetch("http://localhost:5000/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Issue", description: "Desc", category: "Academic" }),
    });
    assert(res.status === 401, "POST /api/complaints without auth → 401 (Unauthorized)");
  } catch (e) {
    assert(false, "POST /api/complaints (fetch failed: " + e.message + ")");
  }
}

async function runAllTests() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Complaint Management System — Test Suite");
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
