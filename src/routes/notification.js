import { Router } from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllRead,
} from "../controller/notification.js";
import { authmiddleware } from "../middleware/authmiddleware.js";

const router = Router();

// All routes require authentication
router.get("/", authmiddleware, getMyNotifications);
router.put("/read-all", authmiddleware, markAllRead);
router.put("/:id/read", authmiddleware, markAsRead);

export default router;
