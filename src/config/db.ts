import mongoose from "mongoose";

const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined");
}

const connectToDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectToDB;
