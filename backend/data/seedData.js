const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

const products = [
  {
    name: "Urban Athletic Performance Tee",
    description: "High-performance t-shirt for urban athletes. Moisture-wicking fabric with superior breathability.",
    price: 34.99,
    originalPrice: 44.99,
    category: "T-Shirts",
    brand: "StreetAthlete",
    images: ["/images/tshirt1.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", code: "#000000" },
      { name: "Navy", code: "#1E3A5F" },
      { name: "Charcoal", code: "#36454F" }
    ],
    inventory: 50,
    featured: true,
    sportType: "training",
    tags: ["performance", "moisture-wicking", "urban"],
    rating: 4.5,
    reviewCount: 23
  },
  // Add 49 more products with similar structure...
];

const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "123456",
    isAdmin: true
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "123456"
  },
  // Add 8 more users...
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    await Product.deleteMany();
    await User.deleteMany();
    
    await Product.insertMany(products);
    await User.insertMany(users);
    
    console.log('Database seeded successfully');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();