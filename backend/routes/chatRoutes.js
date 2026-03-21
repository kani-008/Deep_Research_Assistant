// ./backend/routes/chatRoutes.js

const express = require('express');
const { sendMessage, getChatHistory, getChatById, updateFeedback, deleteChat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { chatLimiter } = require('../middleware/securityMiddleware');

const router = express.Router();

// All chat routes are protected
router.use(protect);

// Chat messaging with rate limiting
router.post('/', chatLimiter, sendMessage);

// Chat history and management
router.get('/history', getChatHistory);
router.get('/:chatId', getChatById);
router.patch('/:chatId/feedback', updateFeedback);
router.delete('/:chatId', deleteChat);

module.exports = router;
