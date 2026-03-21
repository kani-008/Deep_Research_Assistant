// ./backend/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Load env vars
dotenv.config();

// Connect to database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for frontend requests
app.use(cors());

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Deep Research Assistant Backend API Online' });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);

// Custom Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  () => console.log(`🚀 Production Server running in on port ${PORT}`)
);

// Graceful rejection for unhandled promises
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // server.close(() => process.exit(1));
});
