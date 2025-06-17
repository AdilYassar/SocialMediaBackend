const User = require('../models/users');
const Post = require('../models/posts');

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('name email profilePic');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });

    res.status(200).json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch user profile', error: error.message });
  }
};

module.exports = { getUserProfile };
