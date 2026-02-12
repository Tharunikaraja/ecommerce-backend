const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id }).populate("products");

    if (!wishlist) {
      return res.status(200).json({
        message: "Wishlist is empty",
        wishlist: { userId: req.user.id, products: [] },
      });
    }

    res.status(200).json({
      message: "Wishlist retrieved successfully",
      count: wishlist.products.length,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user.id,
        products: [productId],
      });
    } else {
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }
      wishlist.products.push(productId);
    }

    await wishlist.save();
    await wishlist.populate("products");

    res.status(201).json({
      message: "Product added to wishlist successfully",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    if (wishlist.products.length === 0) {
      await Wishlist.deleteOne({ userId: req.user.id });
      return res.status(200).json({
        message: "Product removed from wishlist successfully. Wishlist is now empty",
        wishlist: { userId: req.user.id, products: [] },
      });
    }

    await wishlist.save();
    await wishlist.populate("products");

    res.status(200).json({
      message: "Product removed from wishlist successfully",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if product is in wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      return res.status(200).json({
        message: "Product not in wishlist",
        inWishlist: false,
      });
    }

    const inWishlist = wishlist.products.includes(productId);

    res.status(200).json({
      message: inWishlist ? "Product is in wishlist" : "Product not in wishlist",
      inWishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    await Wishlist.deleteOne({ userId: req.user.id });

    res.status(200).json({
      message: "Wishlist cleared successfully",
      wishlist: { userId: req.user.id, products: [] },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
