// ./backend/services/n8nService.js

const axios = require('axios');
const FormData = require('form-data');

const N8N_CHAT_WEBHOOK = process.env.N8N_CHAT_WEBHOOK || 'http://localhost:5678/webhook/chat';
const N8N_UPLOAD_WEBHOOK = process.env.N8N_UPLOAD_WEBHOOK || 'http://localhost:5678/webhook/upload';

const sendChatToN8n = async (question) => {
  try {
    const response = await axios.post(N8N_CHAT_WEBHOOK, {
      message: question,
      // For context-aware responses, you might pass more data here
      // sessionId can be handled in controller logic and passed to n8n if preferred
    }, {
      timeout: 60000 // RAG operations can take time
    });

    // n8n returns something like { output: '...' } or { response: '...' }
    // Or it might return raw data
    return response.data;
  } catch (error) {
    console.error('n8nService (Chat) Error:', error.message);
    throw new Error('Error communicating with n8n RAG Chat Workflow');
  }
};

const sendFileToN8n = async (file, userId) => {
  try {
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });
    formData.append('userId', userId.toString());

    const response = await axios.post(N8N_UPLOAD_WEBHOOK, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 120000 // Ingestion/embedding can take longer
    });

    return response.data;
  } catch (error) {
    console.error('n8nService (Upload) Error:', error.message || error.response?.data);
    throw new Error('Error communicating with n8n RAG Ingestion Workflow');
  }
};

module.exports = { sendChatToN8n, sendFileToN8n };
