import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { generatetoken } from "../utils/generatetoken.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User with this email does not exist",
        success: false,
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Reset Link URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

    const textMessage = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
Please click on the following link, or paste this into your browser to complete the process within 1 hour:\n\n
${resetUrl}\n\n
If you did not request this, please ignore this email and your password will remain unchanged.\n`;

    const htmlMessage = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Password Reset Request</h2>
        <p>You requested a password reset for your account. Please click the button below to set a new password:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">If you didn't request this email, please ignore it.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: textMessage,
      html: htmlMessage,
    });

    res.status(200).json({
      message: "Password reset link sent successfully",
      success: true,
      // Provide URLs in development response for easy testing
      devResetUrl: resetUrl,
      resetToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to process forgot password request",
      success: false,
    });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset token is invalid or has expired",
        success: false,
      });
    }

    // Hash the new password
    const hashpassword = await bcrypt.hash(newPassword, 10);
    user.password = hashpassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to reset password",
      success: false,
    });
  }
};
