const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger =  require("morgan");
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const app = express();
const fileURLToPath =  require("url");

 

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

connectDB();

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3000/api',
     'http://localhost:3001',
    'https://sporty-urban-ecommerce.onrender.com',
     // Your frontend Render URL
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(logger("dev"));






 
// Stripe webhook needs raw body - must come before express.json()
app.use('/api/stripe/webhook', express.raw({type: 'application/json'}), require('./routes/stripe'));




// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile');
// const uploadRoutes = require('./routes/upload');
const cartRoutes = require('./routes/cart');
const adminProductRoutes = require('./routes/admin/products');
const stripeRoutes = require('./routes/stripe');
// Add this with your other route imports
const uploadRoutes = require('./routes/admin/upload');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/stripe', stripeRoutes);

// Add this with your other route declarations
app.use('/api/admin/upload', uploadRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Also serve from the root uploads if needed
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API route not found' 
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



// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong on the server!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

const PORT = process.env.PORT || 3001;

// Add this to your server.js temporarily
app.get('/api/test-upload', (req, res) => {
  res.json({ message: 'GCS setup ready! Check your environment variables.' });
});

// Log GCS config on server start
console.log('GCS Bucket:', process.env.GCS_BUCKET_NAME);
console.log('GCS Key File:', process.env.GOOGLE_CLOUD_KEY_FILE);


app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});