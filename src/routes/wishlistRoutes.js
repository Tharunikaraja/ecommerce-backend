const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const wishlistController = require("../controllers/wishlistController");

const router = express.Router();

// Get user's wishlist
router.get("/", authMiddleware, wishlistController.getWishlist);

// Add product to wishlist
router.post("/add", authMiddleware, wishlistController.addToWishlist);

// Remove product from wishlist
router.delete("/remove", authMiddleware, wishlistController.removeFromWishlist);

// Check if product is in wishlist
router.get("/check", authMiddleware, wishlistController.checkWishlist);

// Clear wishlist
router.delete("/clear", authMiddleware, wishlistController.clearWishlist);

module.exports = router;
