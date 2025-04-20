// app.js
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const contractsRouter = require('./routes/contracts');
const newsRouter = require('./routes/news');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Increase payload size limit for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Define CORS options
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

// Apply middleware
app.use(cors(corsOptions));
app.use(cookieParser());

// Serve uploads directory as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/contracts', contractsRouter);
app.use('/api/v1/news', newsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

module.exports = app;