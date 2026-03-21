// ./backend/routes/chatRoutes.js

const express = require('express');
const { sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route for chat messaging
router.post('/', protect, sendMessage);

module.exports = router;
