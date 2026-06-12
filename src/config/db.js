import mongoose from "mongoose";
export const connection = async (req, res) => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connect Successfully!");
  } catch (error) {
    console.log(error.message);
  }
};
