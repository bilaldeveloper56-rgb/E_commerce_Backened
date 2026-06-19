import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // The specific user who should receive this notification (null for admin-broadcast)
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // "admin" = broadcast to all admins, "user" = send to specific recipient
    recipientRole: {
      type: String,
      enum: ["admin", "user"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["new_order", "order_confirmed"],
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Track which users have read this (used for admin-broadcast notifications)
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
