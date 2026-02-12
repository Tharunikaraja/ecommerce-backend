const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const cartController = require("../controllers/cartController");

const router = express.Router();

// Get user's cart
router.get("/", authMiddleware, cartController.getCart);

// Add item to cart
router.post("/add", authMiddleware, cartController.addToCart);

// Update cart item quantity
router.put("/update", authMiddleware, cartController.updateCartItem);

// Remove item from cart
router.delete("/remove", authMiddleware, cartController.removeFromCart);

// Clear cart
router.delete("/clear", authMiddleware, cartController.clearCart);

module.exports = router;
