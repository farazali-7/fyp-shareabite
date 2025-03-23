import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/register_users");
    console.log(" MongoDB Connected...");
  } catch (err) {
    console.error(" MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
