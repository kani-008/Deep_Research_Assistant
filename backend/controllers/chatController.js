// ./backend/controllers/chatController.js

const Chat = require('../models/Chat');
const { sendChatToN8n } = require('../services/n8nService');

// @desc    Send chat message to n8n RAG workflow and store history
// @route   POST /api/chat
// @access  Protected
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message/question.' });
    }

    // 1. Forward to n8n workflow
    // (You can pass sessionId to n8n as well to maintain context within n8n workflows)
    const n8nResponse = await sendChatToN8n(message);

    // Assuming n8n returns something like { output: '...', response: '...' }
    // We try to find the answer string from common n8n return keys.
    const answerRaw = n8nResponse.output || n8nResponse.response || n8nResponse.data || n8nResponse;
    const answer = typeof answerRaw === 'object' ? JSON.stringify(answerRaw) : answerRaw;

    // 2. Store chat history in MongoDB
    const chatEntry = await Chat.create({
      userId: req.user.id,
      question: message,
      answer: answer
    });

    // 3. Return response to frontend in requested format
    // Double mapping to 'data.response' for React ChatPage.jsx compatibility
    res.status(200).json({
      success: true,
      answer: answer,
      source: 'n8n',
      id: chatEntry._id,
      data: {
        response: answer
      }
    });

  } catch (err) {
    console.error('Chat Controller Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server error while processing RAG query' });
  }
};
