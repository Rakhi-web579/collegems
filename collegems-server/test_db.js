import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI);

import Resource from "./src/models/Resource.model.js";

async function run() {
  const count = await Resource.countDocuments({});
  console.log("Total resources:", count);
  const activeCount = await Resource.countDocuments({ status: "active" });
  console.log("Active resources:", activeCount);
  process.exit(0);
}
run();
