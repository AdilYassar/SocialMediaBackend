const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/connect/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON with increased size limit
app.use(express.json({
  limit: '10mb', // Increase JSON payload limit to 10MB
}));

// Middleware to parse URL-encoded data with increased size limit
app.use(express.urlencoded({
  extended: true,
  limit: '10mb', // Increase URL-encoded payload limit to 10MB
  parameterLimit: 50000, // Increase parameter limit
}));

// Middleware to parse raw bodies for handling binary data
app.use(express.raw({
  type: ['image/*', 'application/octet-stream'],
  limit: '10mb', // Increase raw payload limit to 10MB
}));

// Middleware to parse text bodies
app.use(express.text({
  limit: '10mb', // Increase text payload limit to 10MB
}));

// Enable CORS for specified origins
app.use(cors());

// Middleware to log request sizes
app.use((req, res, next) => {
  if (req.get('content-length')) {
    const sizeInMB = parseInt(req.get('content-length'), 10) / (1024 * 1024);
    if (sizeInMB > 1) {
      console.log(`Large request detected: ${sizeInMB.toFixed(2)} MB`);
    }
  }
  next();
});

// Base API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/posts', require('./src/routes/postRoutes'));
app.use('/api/profile', require('./src/routes/profileRoutes'));

// Default Route for Missing Endpoints
app.use((req, res, next) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle "Payload Too Large" error
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload Too Large',
      message: 'The request size exceeds the maximum allowed limit of 10MB',
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

