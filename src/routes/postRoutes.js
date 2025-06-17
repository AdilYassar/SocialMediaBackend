const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  createPost,
  getFeed,
  likePost,
  commentOnPost,
} = require('../controllers/postContoller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Create a new post with optional image upload
router.post('/create',   createPost);

// Get feed
router.get('/feed', getFeed);

// Like/unlike a post
router.post('/like/:postId', authMiddleware, likePost);

// Comment on a post
router.post('/comment/:postId', authMiddleware, commentOnPost);

module.exports = router;