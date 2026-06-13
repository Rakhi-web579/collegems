import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log("MongoDB In-Memory Server Connected");
  } catch (err) {
    console.error(err);
  }
};
