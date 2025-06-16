const User = require('../models/users');
const Post = require('../models/posts');

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the user's posts
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });

    res.status(200).json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProfile };
