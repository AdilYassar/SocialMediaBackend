const Post = require('../models/posts');
const Comment = require('../models/comments');

const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;

    // Create a new post
    const post = await Post.create({
      text,
      image,
      author: req.user._id, // Extracted from authMiddleware
    });

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeed = async (req, res) => {
  try {
    // Get all posts with their authors
    const posts = await Post.find()
      .populate('author', 'name profilePic')
      .populate('comments')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add/remove user from likes
    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter((userId) => userId.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json({ message: 'Post liked/unliked successfully', post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create a new comment
    const comment = await Comment.create({
      text,
      author: req.user._id,
      post: postId,
    });

    // Add comment to the post
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPost, getFeed, likePost, commentOnPost };
