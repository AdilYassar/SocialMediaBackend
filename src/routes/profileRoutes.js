const express = require('express');
const { getUserProfile } = require('../controllers/profileController');



const router = express.Router();

router.get('/:userId', getUserProfile);

module.exports = router;
