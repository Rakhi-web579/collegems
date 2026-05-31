import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error(
    "Missing MONGO_URI in .env. Please set MONGO_URI to your MongoDB connection string."
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET in .env. Please set a JWT secret.");
  process.exit(1);
}

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
