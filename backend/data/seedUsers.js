const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();


// Update the users array to include profile data:
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: '123456',
    isAdmin: true,
    profile: {
      phone: '+1234567890',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male'
    },
    addresses: [{
      type: 'shipping',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      isDefault: true
    }],
    paymentMethods: [{
      type: 'credit_card',
      cardType: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2025',
      isDefault: true
    }],
    preferences: {
      newsletter: true,
      smsNotifications: false,
      emailNotifications: true
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '123456',
    isAdmin: false,
    profile: {
      phone: '+1234561111',
      dateOfBirth: new Date('1990-02-12'),
      gender: 'male'
    },
    addresses: [{
      type: 'shipping',
      street: '501 Allen St',
      city: 'Bronx',
      state: 'NY',
      zipCode: '10452',
      country: 'United States',
      isDefault: true
    }],
    paymentMethods: [{
      type: 'credit_card',
      cardType: 'visa',
      last4: '4040',
      expiryMonth: '08',
      expiryYear: '2032',
      isDefault: true
    }],
    preferences: {
      newsletter: true,
      smsNotifications: false,
      emailNotifications: true
    }
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: '123456',
    isAdmin: false,
    profile: {
      phone: '+1234565555',
      dateOfBirth: new Date('1995-11-21'),
      gender: 'male'
    },
    addresses: [{
      type: 'shipping',
      street: '456 Convent ave.',
      city: 'New York',
      state: 'NY',
      zipCode: '10021',
      country: 'United States',
      isDefault: true
    }],
    paymentMethods: [{
      type: 'credit_card',
      cardType: 'visa',
      last4: '9988',
      expiryMonth: '10',
      expiryYear: '2030',
      isDefault: true
    }],
    preferences: {
      newsletter: true,
      smsNotifications: false,
      emailNotifications: true
    },
    cart: [
      {
        product: '507f1f77bcf86cd799439011', // Sample product ID
        quantity: 2,
        size: 'M',
        color: 'Black'
      },
      {
        product: '507f1f77bcf86cd799439012', // Another sample product ID
        quantity: 1,
        size: 'L',
        color: 'Blue'
      }
    ],
  },
  
  // ... other users
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