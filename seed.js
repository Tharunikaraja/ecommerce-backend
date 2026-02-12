const mongoose = require("mongoose")
const Product = require("./src/models/Product")
require("dotenv").config()

const sampleProducts = [
  // Men's Products
  {
    name: "Men's Cotton T-Shirt",
    description: "Comfortable and durable cotton t-shirt for men",
    price: 15.99,
    category: "Men",
    image: "https://via.placeholder.com/300?text=Men+Tshirt",
    stock: 50,
    rating: 4.5
  },
  {
    name: "Men's Denim Jeans",
    description: "Classic blue denim jeans for men",
    price: 49.99,
    category: "Men",
    image: "https://via.placeholder.com/300?text=Men+Jeans",
    stock: 30,
    rating: 4.8
  },
  {
    name: "Men's Formal Shirt",
    description: "White formal shirt perfect for office",
    price: 39.99,
    category: "Men",
    image: "https://via.placeholder.com/300?text=Men+Formal",
    stock: 25,
    rating: 4.3
  },
  // Women's Products
  {
    name: "Women's Saree",
    description: "Elegant traditional silk saree for women",
    price: 79.99,
    category: "Women",
    image: "https://via.placeholder.com/300?text=Women+Saree",
    stock: 20,
    rating: 4.9
  },
  {
    name: "Women's Kurti",
    description: "Comfortable cotton kurti for casual wear",
    price: 29.99,
    category: "Women",
    image: "https://via.placeholder.com/300?text=Women+Kurti",
    stock: 40,
    rating: 4.6
  },
  {
    name: "Women's Lehenga",
    description: "Beautiful embroidered lehenga set",
    price: 99.99,
    category: "Women",
    image: "https://via.placeholder.com/300?text=Women+Lehenga",
    stock: 15,
    rating: 4.7
  },
  // Kids Products
  {
    name: "Kids T-Shirt",
    description: "Colorful and comfortable t-shirt for kids",
    price: 12.99,
    category: "Kids",
    image: "https://via.placeholder.com/300?text=Kids+Tshirt",
    stock: 60,
    rating: 4.4
  },
  {
    name: "Kids Shorts",
    description: "Breathable shorts for active kids",
    price: 18.99,
    category: "Kids",
    image: "https://via.placeholder.com/300?text=Kids+Shorts",
    stock: 45,
    rating: 4.5
  },
  {
    name: "Kids Ethnic Wear",
    description: "Traditional ethnic dress for kids",
    price: 45.99,
    category: "Kids",
    image: "https://via.placeholder.com/300?text=Kids+Ethnic",
    stock: 20,
    rating: 4.8
  }
]

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    await Product.deleteMany({})
    console.log("Cleared existing products")

    const inserted = await Product.insertMany(sampleProducts)
    console.log(`Successfully inserted ${inserted.length} products`)

    process.exit(0)
  } catch (error) {
    console.error("Error seeding products:", error)
    process.exit(1)
  }
}

seedProducts()
