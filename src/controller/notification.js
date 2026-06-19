import { Notification } from "../models/Notification.js";

// @desc    Get notifications for the logged-in user
// @route   GET /api/notification/
// @access  Private
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let notifications;

    if (userRole === "admin") {
      // Admins see all admin-broadcast notifications
      // unread = not in readBy array; read = in readBy array
      notifications = await Notification.find({ recipientRole: "admin" })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      // Attach a per-admin isRead flag
      notifications = notifications.map((n) => ({
        ...n,
        isRead: n.readBy.some((id) => id.toString() === userId.toString()),
      }));
    } else {
      // Regular users see only their own notifications
      notifications = await Notification.find({
        recipientRole: "user",
        recipient: userId,
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notification/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    if (userRole === "admin") {
      // Add user to readBy if not already there
      if (!notification.readBy.some((id) => id.toString() === userId.toString())) {
        notification.readBy.push(userId);
        await notification.save();
      }
    } else {
      // User-specific notification
      if (notification.recipient.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      notification.isRead = true;
      await notification.save();
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark ALL notifications as read for the logged-in user
// @route   PUT /api/notification/read-all
// @access  Private
export const markAllRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole === "admin") {
      // Add this admin to readBy for every admin notification they haven't read
      const unread = await Notification.find({
        recipientRole: "admin",
        readBy: { $ne: userId },
      });

      await Promise.all(
        unread.map((n) => {
          n.readBy.push(userId);
          return n.save();
        })
      );
    } else {
      await Notification.updateMany(
        { recipientRole: "user", recipient: userId, isRead: false },
        { $set: { isRead: true } }
      );
    }

    res
      .status(200)
      .json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
