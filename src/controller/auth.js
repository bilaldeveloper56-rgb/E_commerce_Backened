import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { generatetoken } from "../utils/generatetoken.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(402).json({
        message: "User Already Exist",
      });
    }
    const hashpassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashpassword,
      role: "user",
    });
    res.status(201).json({
      message: "User Created Successfully!",
      success: true,
      data: newUser,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const isEmailmatch = await User.findOne({ email });

    if (!isEmailmatch) {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
      });
    }

    const isPasswordmatch = await bcrypt.compare(
      password,
      isEmailmatch.password,
    );

    if (!isPasswordmatch) {
      return res.status(401).json({
        message: "Invalid Password",
        success: false,
      });
    }

    const token = generatetoken(isEmailmatch._id, isEmailmatch.role);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Login Successfully",
      success: true,
      data: token,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
export const getme = async (req, res) => {
  try {
    const user = req.user;
    const isExist = await User.findById({ _id: user._id }).select("-password");
    if (!isExist) {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "User Fetched Successfully",
      success: true,
      data: isExist,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
