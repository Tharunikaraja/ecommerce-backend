const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const orderController = require("../controllers/orderController");

// Get all orders for user
router.get("/", authMiddleware, orderController.getUserOrders);

// Get order by ID
router.get("/:id", authMiddleware, orderController.getOrderById);

// Create new order
router.post("/create", authMiddleware, orderController.createOrder);

// Update order status
router.put("/:id/status", authMiddleware, orderController.updateOrderStatus);

// Cancel order
router.delete("/:id/cancel", authMiddleware, orderController.cancelOrder);

module.exports = router;
