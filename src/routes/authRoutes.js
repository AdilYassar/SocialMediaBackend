const express = require('express');
const router = express.Router();
const { registerUser, loginUser, upload } = require('../controllers/authController');

// Use multer middleware to handle profilePic
router.post('/register', upload.single('profilePic'), registerUser);
router.post('/login', loginUser);

module.exports = router;
