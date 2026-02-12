const express = require("express")
const router = express.Router()  
const { getProducts, getProductById } = require("../controllers/productController")

// Get all products or filter by category (public access)
router.get("/", getProducts)

// Get product by ID (public access)  
router.get("/:id", getProductById)

module.exports = router
