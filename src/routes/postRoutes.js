const express = require('express');
const { createPost, getFeed, likePost, commentOnPost } = require('../controllers/postContoller');
const authMiddleware = require('../middleware/authMiddleWare');

const router = express.Router();

router.post('/create', authMiddleware, createPost);
router.get('/feed', authMiddleware, getFeed);
router.post('/like/:postId', authMiddleware, likePost);
router.post('/comment/:postId', authMiddleware, commentOnPost);

module.exports = router;
