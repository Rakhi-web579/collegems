import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { startFeeCronJobs, startAnalyticsCronJobs, startLibraryCronJobs, startAttendanceCronJobs } from "./src/utils/cronJobs.js";

import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { execSync } from "child_process";
import { allowedOrigins } from "./src/config/cors.js";
import configureSocketIO from "./src/socket/socket.js";
const PORT = process.env.PORT || 5000;

const freePort = () => {
  try {
    const pid = execSync(`lsof -ti:${PORT}`, { encoding: "utf8", timeout: 2000 }).trim();
    if (pid) {
      execSync(`kill -9 ${pid}`, { timeout: 1000 });
      console.log(`Freed port ${PORT} (killed PID ${pid})`);
    }
  } catch {
    // port is free
  }
};

if (!process.env.MONGO_URI) {
  console.error(
    "Missing MONGO_URI in .env. Please set MONGO_URI to your MongoDB connection string.",
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error(
    "Missing JWT secrets in .env. Please set both JWT_SECRET and JWT_REFRESH_SECRET.",
  );
  process.exit(1);
}

connectDB();

startFeeCronJobs();
startAnalyticsCronJobs();
startLibraryCronJobs();
startAttendanceCronJobs();

const httpServer = createServer(app);


const io = configureSocketIO(httpServer, app);

freePort();

const startServer = (attempt = 0) => {
  if (attempt > 0) freePort();

  httpServer.once("error", (err) => {
    if (err.code === "EADDRINUSE" && attempt < 10) {
      console.log(`Port ${PORT} in use, killing contender and retrying (attempt ${attempt + 1})`);
      setTimeout(() => startServer(attempt + 1), 100);
    } else {
      console.error(`Failed to start server on port ${PORT}:`, err.message);
      process.exit(1);
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

setTimeout(() => startServer(), 200);
