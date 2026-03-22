// ./backend/controllers/chatController.js

const Chat = require('../models/Chat');
const { sendChatToN8n } = require('../services/n8nService');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { createErrors } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Send chat message with session context
 * POST /api/v1/chat
 * Enhanced: Includes previous chat context for better RAG responses
 */
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { message, sessionId } = req.body;

  // Validation
  if (!message || message.trim().length === 0) {
    return next(createErrors.badRequest('Message cannot be empty'));
  }

  if (message.length > 5000) {
    return next(createErrors.badRequest('Message exceeds maximum length of 5000 characters'));
  }

  try {
    const startTime = Date.now();

    // Get previous chat context for this session
    const previousChats = sessionId
      ? await Chat.getSessionContext(req.user._id, sessionId, 5)
      : [];

    // Send to n8n with context and strict RAG instructions
    const n8nResponse = await sendChatToN8n(message, previousChats, {
      userId: req.user._id.toString(),
      sessionId: sessionId || 'default',
      systemInstructions: "Answer ONLY using the provided document context. If the answer is not contained within the documents, state that you cannot find the information in the current research context. Do not use general knowledge.",
      strictRAG: true
    });

    // Extract answer with robust error handling/fallback support
    let answer = "I'm sorry, I'm having trouble connecting to my research engine right now.";
    
    if (n8nResponse.success) {
      const raw = n8nResponse.data;

      // n8n "Text" mode returns a plain string directly
      if (typeof raw === 'string' && raw.trim()) {
        answer = raw.trim();
      } else if (typeof raw === 'object' && raw !== null) {
        // Fallback: handle all object shapes n8n might return
        const answerRaw =
          raw.output ||
          raw.answer ||
          raw.response ||
          raw.text ||
          raw.message ||
          raw.data;

        if (typeof answerRaw === 'string' && answerRaw.trim()) {
          answer = answerRaw.trim();
        } else if (typeof answerRaw === 'object' && answerRaw !== null) {
          // Double-nested object — extract string value
          answer = answerRaw.output || answerRaw.answer || answerRaw.response || answerRaw.text || JSON.stringify(answerRaw);
        } else {
          answer = JSON.stringify(raw);
        }
      }
    } else if (n8nResponse.fallback && n8nResponse.message) {
      answer = n8nResponse.message;
    }

    // Store chat in database (answer is now guaranteed to be a valid string)
    const chatEntry = await Chat.create({
      userId: req.user._id,
      sessionId: sessionId || new Date().getTime().toString(),
      question: message.trim(),
      answer: answer,
      metadata: {
        processingTime: n8nResponse.processingTime,
        model: 'n8n-rag'
      },
      status: n8nResponse.success ? 'completed' : 'failed'
    });

    const processingTime = Date.now() - startTime;

    logger.info('Chat message processed', {
      userId: req.user._id,
      chatId: chatEntry._id,
      processingTime
    });

    res.status(200).json({
      success: true,
      message: 'Message processed successfully',
      data: {
        response: answer,
        chatId: chatEntry._id,
        sessionId: chatEntry.sessionId,
        processingTime,
        metadata: chatEntry.metadata
      }
    });
  } catch (error) {
    logger.error('Chat processing error', {
      userId: req.user._id,
      error: error.message
    });

    return next(createErrors.serverError('Failed to process chat message'));
  }
});

/**
 * Get chat history with pagination
 * GET /api/v1/chat/history?page=1&limit=20&sessionId=xxx
 */
exports.getChatHistory = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, sessionId } = req.query;

  try {
    const history = await Chat.getChatHistory(req.user._id, parseInt(page), parseInt(limit), sessionId);

    logger.info('Chat history retrieved', {
      userId: req.user._id,
      page,
      limit,
      count: history.data.length
    });

    res.status(200).json({
      success: true,
      data: history.data,
      pagination: history.pagination
    });
  } catch (error) {
    logger.error('Error retrieving chat history', { error: error.message });
    return next(createErrors.serverError('Failed to retrieve chat history'));
  }
});

/**
 * Get single chat by ID
 * GET /api/v1/chat/:chartId
 */
exports.getChatById = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  const chat = await Chat.findOne({
    _id: chatId,
    userId: req.user._id
  });

  if (!chat) {
    return next(createErrors.notFound('Chat message not found'));
  }

  res.status(200).json({
    success: true,
    data: chat
  });
});

/**
 * Update chat feedback/rating
 * PATCH /api/v1/chat/:chatId/feedback
 */
exports.updateFeedback = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  const { rating, comment, isAccurate } = req.body;

  // Validate rating
  if (rating && (rating < 1 || rating > 5)) {
    return next(createErrors.badRequest('Rating must be between 1 and 5'));
  }

  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, userId: req.user._id },
    {
      feedback: {
        rating,
        comment,
        isAccurate,
        flaggedAt: isAccurate === false ? Date.now() : null
      }
    },
    { new: true }
  );

  if (!chat) {
    return next(createErrors.notFound('Chat message not found'));
  }

  logger.info('Chat feedback updated', {
    chatId,
    userId: req.user._id,
    rating
  });

  res.status(200).json({
    success: true,
    message: 'Feedback updated successfully',
    data: chat
  });
});

/**
 * Delete chat history
 * DELETE /api/v1/chat/:chatId
 */
exports.deleteChat = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  const chat = await Chat.findOneAndDelete({
    _id: chatId,
    userId: req.user._id
  });

  if (!chat) {
    return next(createErrors.notFound('Chat message not found'));
  }

  logger.info('Chat deleted', { chatId, userId: req.user._id });

  res.status(200).json({
    success: true,
    message: 'Chat deleted successfully'
  });
});