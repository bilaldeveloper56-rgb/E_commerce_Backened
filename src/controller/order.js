import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

// @desc    Create new order
// @route   POST /api/order/create
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { items, totalPrice } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No order items" });
    }

    const order = new Order({
      user: req.user._id,
      items: items.map((item) => ({
        product: item._id, // The frontend cart has _id representing the product ID
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl,
      })),
      totalPrice,
      status: "Processing",
    });

    const createdOrder = await order.save();

    // Notify all admins that a new order was placed
    try {
      await Notification.create({
        recipientRole: "admin",
        message: `New order placed by ${req.user.name || "a user"} — $${totalPrice.toFixed(2)} total`,
        type: "new_order",
        orderId: createdOrder._id,
      });
    } catch (notifErr) {
      // Non-fatal — order still created successfully
      console.error("Failed to create admin notification:", notifErr.message);
    }

    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/order/myorders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/order/all
// @access  Private/Admin
export const getAllOrdersAdmin = async (req, res) => {
  try {
    // Populate user to get name/email if needed
    const orders = await Order.find({})
      .populate("user", "id name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order to confirmed and decrease stock
// @route   PUT /api/order/:id/confirm
// @access  Private/Admin
export const confirmOrderAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "Confirmed") {
      return res.status(400).json({ success: false, message: "Order is already confirmed" });
    }

    // Decrease stock for each product in the order
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        // Ensure stock doesn't go below 0
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    order.status = "Confirmed";
    const updatedOrder = await order.save();

    // Notify the user that their order has been confirmed
    try {
      // Build a readable item summary (first 2 items)
      const itemNames = order.items
        .slice(0, 2)
        .map((i) => i.title)
        .join(", ");
      const extra = order.items.length > 2 ? ` +${order.items.length - 2} more` : "";
      await Notification.create({
        recipient: order.user,
        recipientRole: "user",
        message: `Your order for ${itemNames}${extra} has been confirmed! 🎉`,
        type: "order_confirmed",
        orderId: updatedOrder._id,
      });
    } catch (notifErr) {
      console.error("Failed to create user notification:", notifErr.message);
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
