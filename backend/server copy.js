const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const  logger =  require("morgan");
const connectDB = require('./config/database');
// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile');
// const uploadRoutes = require('./routes/upload');
const cartRoutes = require('./routes/cart');
const adminProductRoutes = require('./routes/admin/products');
const stripeRoutes = require('./routes/stripe');  
const path = require('path');
const app = express();
// Serve static assets from react build
app.use(express.static(path.join(__dirname, "/client/build")));

app.get("/", (req,res)=>
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
)
app.get("/login", (req,res)=>
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
)
app.get("/register", (req,res)=>
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
)
app.get("/product", (req,res)=>
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
)

app.get("/cart", (req,res)=>
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
)
app.get("/checkout", (req,res)=>
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
  )

  app.get("/placeorder", (req,res)=>
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
)
  app.get("/profile", (req,res)=>
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
)
  app.get("/order", (req,res)=>
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
)
  app.get("/admin", (req,res)=>
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
)
  app.get("/products", (req,res)=>
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
)


dotenv.config();

connectDB();



// Add this with other routes (before the JSON middleware for webhooks)
// app.use('/api/stripe', require('./routes/stripe'));


// Webhook needs raw body, so add it before express.json()
app.use('/api/stripe/webhook', express.raw({type: 'application/json'}), require('./routes/stripe'));
 
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const router = express.Router();


// logging (development)
app.use(logger("dev"));

// Enhanced CORS configuration
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/profile', require('./routes/profile')); 
app.use('/api/cart', require('./routes/cart'));
app.use('/api/admin/products', require("./routes/admin/products"));




// Add admin routes
// app.use('/api/admin/products', require('./routes/admin/products'));


// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running!', 
       message: 'Backend server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

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

const PORT = process.env.PORT || '0.0.0.0';
// const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});