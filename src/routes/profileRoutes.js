const express = require('express');
const { getUserProfile } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleWare');

const router = express.Router();

router.get('/:userId', authMiddleware, getUserProfile);

module.exports = router;
