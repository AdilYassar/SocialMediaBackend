const Post = require('../models/posts');
const Comment = require('../models/comments');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware to handle both JSON and multipart data
const handleUpload = (req, res, next) => {
  const contentType = req.get('content-type');
  
  if (contentType && contentType.includes('multipart/form-data')) {
    // Handle multipart form data
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ 
          message: 'File upload error', 
          error: err.message 
        });
      }
      next();
    });
  } else {
    // Handle JSON data (existing flow)
    next();
  }
};

const createPost = async (req, res) => {
  try {
    console.log('Create post request received');
    console.log('Content-Type:', req.get('content-type'));
    console.log('Request body keys:', Object.keys(req.body));
    console.log('File present:', !!req.file);

    // Extract authorId from request body (sent from frontend)
    const { text, imageUrl, authorId } = req.body;
    let finalImageUrl = imageUrl;
    
    // Handle uploaded file (multipart form data)
    if (req.file) {
      // Convert uploaded file to base64 data URL
      const base64Data = req.file.buffer.toString('base64');
      finalImageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
      console.log('File uploaded:', {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        sizeInMB: (req.file.size / (1024 * 1024)).toFixed(2)
      });
    }
    
    // Validate input - allow empty text if image is provided
    if (!text && !finalImageUrl) {
      return res.status(400).json({ 
        message: 'Post must contain either text or an image' 
      });
    }

    // Validate that authorId is provided
    if (!authorId) {
      return res.status(400).json({ 
        message: 'Author ID is required' 
      });
    }

    // Prepare post data
    const postData = {
      text: text || '',
      author: authorId, // Use authorId as the author field
    };

    // Add image URL if provided
    if (finalImageUrl) {
      postData.image = finalImageUrl;
      console.log('Image URL length:', finalImageUrl.length);
      console.log('Image URL preview:', finalImageUrl.substring(0, 50) + '...');
    }

    console.log('Creating post with data:', {
      text: postData.text,
      author: postData.author,
      hasImage: !!postData.image,
      imageSize: postData.image ? `${(finalImageUrl.length / 1024).toFixed(2)}KB` : 'N/A'
    });

    // Create the post
    const post = await Post.create(postData);

    // Try to populate author details
    try {
      await post.populate('author', 'name profilePic email');
    } catch (populateError) {
      console.log('Could not populate author:', populateError.message);
    }

    console.log('Post created successfully with ID:', post._id);

    res.status(201).json({ 
      success: true,
      message: 'Post created successfully', 
      post: {
        ...post.toObject(),
        // Don't send full image back in response to save bandwidth
        image: post.image ? `[Image: ${(post.image.length / 1024).toFixed(2)}KB]` : undefined
      }
    });

  } catch (error) {
    console.error('Error creating post:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid author ID format',
        error: 'Please provide a valid user ID'
      });
    }
    
    // Handle document too large error
    if (error.code === 17419) {
      return res.status(413).json({
        success: false,
        message: 'Image too large for database storage',
        error: 'Please use a smaller image (max 2MB recommended)'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Unable to create post', 
      error: error.message 
    });
  }
};

const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'name profilePic email')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name profilePic email'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ 
      message: 'Unable to fetch feed', 
      error: error.message 
    });
  }
};

const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body; // Get userId from request body instead of req.user

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIndex = post.likes.findIndex(
      (id) => id.toString() === userId.toString()
    );

    let isLiked;
    if (userIndex === -1) {
      // Like the post
      post.likes.push(userId);
      isLiked = true;
    } else {
      // Unlike the post
      post.likes.splice(userIndex, 1);
      isLiked = false;
    }

    await post.save();
    
    res.status(200).json({ 
      message: isLiked ? 'Post liked' : 'Post unliked',
      isLiked,
      likesCount: post.likes.length
    });

  } catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).json({ 
      message: 'Unable to like/unlike post', 
      error: error.message 
    });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, userId } = req.body; // Get userId from request body

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      text: text.trim(),
      author: userId,
      post: postId,
    });

    // Try to populate author details
    try {
      await comment.populate('author', 'name profilePic email');
    } catch (populateError) {
      console.log('Could not populate comment author:', populateError.message);
    }

    // Add comment to post
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json({ 
      message: 'Comment added successfully', 
      comment 
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      message: 'Unable to add comment', 
      error: error.message 
    });
  }
};

module.exports = { 
  createPost: [handleUpload, createPost], // Apply middleware first
  getFeed, 
  likePost, 
  commentOnPost 
};