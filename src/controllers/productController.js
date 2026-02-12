const Product = require("../models/Product")

// Get all products or filter by category
const getProducts = async (req, res) => {
  try {
    const { category } = req.query

    let filter = {}
    if (category && category !== "all") {
      // Case-insensitive category search
      filter.category = new RegExp(`^${category}$`, "i")
    }

    const products = await Product.find(filter)

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" })
    }

    res.status(200).json({
      message: "Products retrieved successfully",
      count: products.length,
      products
    })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params

    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      product
    })
  } catch (error) {
    console.error("Get product by ID error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = { getProducts, getProductById }
