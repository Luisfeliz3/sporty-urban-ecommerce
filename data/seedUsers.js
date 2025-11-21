const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: '123456',
    isAdmin: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: '123456'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '123456'
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sporty-urban-ecommerce');
    console.log('MongoDB connected');

    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users deleted');

    // Create new users
    const createdUsers = await User.insertMany(users);
    console.log('Users seeded successfully:');
    
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });

    process.exit();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();