// ./backend/services/n8nService.js

const axios = require('axios');
const FormData = require('form-data');
const logger = require('../utils/logger');

const N8N_CHAT_WEBHOOK = process.env.N8N_CHAT_WEBHOOK || 'http://localhost:5678/webhook/chat';
const N8N_UPLOAD_WEBHOOK = process.env.N8N_UPLOAD_WEBHOOK || 'http://localhost:5678/webhook/upload';
const N8N_DELETE_WEBHOOK = process.env.N8N_DELETE_WEBHOOK || 'http://localhost:5678/webhook/delete';

const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  timeout: 120000
};

const retryWithBackoff = async (fn, retries = 0) => {
  try {
    return await fn();
  } catch (error) {
    if (retries < RETRY_CONFIG.maxRetries) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retries);
      logger.warn(`Retry attempt ${retries + 1}/${RETRY_CONFIG.maxRetries} after ${delay}ms`, {
        error: error.message
      });
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries + 1);
    }
    throw error;
  }
};

const sendChatToN8n = async (question, previousChats = null, metadata = {}) => {
  const startTime = Date.now();
  try {
    const payload = {
      message: question,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    if (previousChats && previousChats.length > 0) {
      payload.context = previousChats.map(chat => ({
        question: chat.question,
        answer: chat.answer
      }));
    }
    const response = await retryWithBackoff(() =>
      axios.post(N8N_CHAT_WEBHOOK, payload, {
        timeout: RETRY_CONFIG.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Deep-Research-Assistant/2.0'
        }
      })
    );
    const processingTime = Date.now() - startTime;
    logger.info('n8n chat request successful', {
      processingTime,
      messageLength: question.length,
      contextSize: previousChats?.length || 0
    });
    return { success: true, data: response.data, processingTime };
  } catch (error) {
    logger.error('n8n chat service failed after retries', {
      error: error.message,
      statusCode: error.response?.status,
      processingTime: Date.now() - startTime
    });
    return generateFallbackResponse(error);
  }
};

const sendFileToN8n = async (file, userId) => {
  const startTime = Date.now();
  try {
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size
    });
    formData.append('userId', userId.toString());
    formData.append('originalName', file.originalname);
    formData.append('uploadedAt', new Date().toISOString());
    formData.append('fileSize', file.size.toString());

    const formHeaders = formData.getHeaders();

    logger.info('Sending file to n8n upload webhook', {
      webhook: N8N_UPLOAD_WEBHOOK,
      filename: file.originalname,
      size: file.size
    });

    const response = await retryWithBackoff(() =>
      axios.post(N8N_UPLOAD_WEBHOOK, formData, {
        headers: {
          ...formHeaders,
          'User-Agent': 'Deep-Research-Assistant/2.0'
        },
        timeout: RETRY_CONFIG.timeout,
        maxContentLength: 100 * 1024 * 1024,
        maxBodyLength: 100 * 1024 * 1024
      })
    );

    const processingTime = Date.now() - startTime;
    const responseData = response.data;

    // Extract Google Drive file ID from n8n Ingestion Workflow response
    // n8n "Respond to Webhook" returns: { id, driveFileId, name, driveFileName, ... }
    const driveFileId =
      responseData?.driveFileId ||
      responseData?.id ||
      responseData?.fileId ||
      (Array.isArray(responseData) ? responseData[0]?.id : null) ||
      null;

    const driveFileName =
      responseData?.driveFileName ||
      responseData?.name ||
      file.originalname;

    logger.info('n8n file upload successful', {
      filename: file.originalname,
      driveFileId: driveFileId || 'NOT RETURNED — check Ingestion Workflow Respond node',
      processingTime
    });

    return {
      success: true,
      data: responseData,
      driveFileId,
      driveFileName,
      processingTime
    };
  } catch (error) {
    logger.error('n8n file upload failed after retries', {
      filename: file.originalname,
      error: error.message,
      statusCode: error.response?.status,
      processingTime: Date.now() - startTime
    });
    return generateFallbackResponse(error, 'upload');
  }
};

/**
 * Delete file from Google Drive + Qdrant via n8n delete webhook
 */
const deleteFileFromN8n = async (driveFileId, originalName, userId) => {
  const startTime = Date.now();
  try {
    const payload = {
      driveFileId,
      originalName,
      userId: userId.toString(),
      deletedAt: new Date().toISOString()
    };

    logger.info('Sending delete request to n8n', { driveFileId, originalName, webhook: N8N_DELETE_WEBHOOK });

    const response = await retryWithBackoff(() =>
      axios.post(N8N_DELETE_WEBHOOK, payload, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Deep-Research-Assistant/2.0'
        }
      })
    );

    logger.info('n8n delete successful', {
      driveFileId,
      processingTime: Date.now() - startTime
    });

    return { success: true, data: response.data };
  } catch (error) {
    logger.error('n8n delete failed', {
      driveFileId,
      error: error.message,
      statusCode: error.response?.status
    });
    return {
      success: false,
      error: error.message,
      statusCode: error.response?.status || 503
    };
  }
};

const healthCheck = async () => {
  try {
    const response = await axios.get(
      N8N_CHAT_WEBHOOK.replace('/webhook/chat', '/health'),
      { timeout: 5000 }
    );
    logger.info('n8n health check passed', { status: response.status });
    return { healthy: true, status: response.status };
  } catch (error) {
    logger.error('n8n health check failed', { error: error.message });
    return { healthy: false, error: error.message };
  }
};

const generateFallbackResponse = (error, type = 'chat') => {
  const isNetworkError = error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET';
  const isTimeout = error.code === 'ECONNABORTED' || error.response?.status === 504;

  if (type === 'chat') {
    return {
      success: false,
      error: 'n8n service temporarily unavailable',
      fallback: true,
      message: isTimeout
        ? 'RAG processing took too long. Please try with a shorter query.'
        : isNetworkError
        ? 'Cannot connect to RAG service. Please try again later.'
        : 'RAG service is temporarily unavailable. Please try again.',
      statusCode: error.response?.status || 503
    };
  }

  return {
    success: false,
    error: 'n8n upload service temporarily unavailable',
    fallback: true,
    message: isTimeout
      ? 'File processing took too long. Please try again.'
      : isNetworkError
      ? 'Cannot connect to upload service. Please try again later.'
      : 'Upload service is temporarily unavailable. Please try again.',
    statusCode: error.response?.status || 503
  };
};

module.exports = {
  sendChatToN8n,
  sendFileToN8n,
  deleteFileFromN8n,
  healthCheck,
  retryWithBackoff
};