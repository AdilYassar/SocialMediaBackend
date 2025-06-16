const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    image: { type: String, default: '' }, // Image URL
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of User IDs
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
