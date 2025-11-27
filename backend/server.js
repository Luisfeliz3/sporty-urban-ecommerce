const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger =  require("morgan");
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const app = express();
const fileURLToPath =  require("url");

app.use(logger("dev"));

const PORT = process.env.PORT || 3001;
// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

connectDB();



// Serve static assets from react build
app.use(express.static(path.join(__dirname, "/frontend/build")));

app.get("/dashboard", (req,res)=>
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
)

app.get("/activity", (req,res)=>
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
)
app.get("/login", (req,res)=>
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
  )



// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://sporty-urban-ecommerce.onrender.com', // Your frontend Render URL
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Stripe webhook needs raw body - must come before express.json()
app.use('/api/stripe/webhook', express.raw({type: 'application/json'}), require('./routes/stripe'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile');
// const uploadRoutes = require('./routes/upload');
const cartRoutes = require('./routes/cart');
const adminProductRoutes = require('./routes/admin/products');
const stripeRoutes = require('./routes/stripe');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
// app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/stripe', stripeRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API route not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong on the server!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});



app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});