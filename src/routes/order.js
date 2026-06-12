import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrdersAdmin,
  confirmOrderAdmin,
} from "../controller/order.js";
import { authmiddleware } from "../middleware/authmiddleware.js";
import rolemiddleware from "../middleware/rolemiddleware.js";

const router = Router();

// User routes
router.post("/create", authmiddleware, createOrder);
router.get("/myorders", authmiddleware, getUserOrders);

// Admin routes
router.get("/all", authmiddleware, rolemiddleware, getAllOrdersAdmin);
router.put("/:id/confirm", authmiddleware, rolemiddleware, confirmOrderAdmin);

export default router;
