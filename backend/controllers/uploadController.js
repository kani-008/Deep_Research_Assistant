// ./backend/controllers/uploadController.js

const { sendFileToN8n } = require('../services/n8nService');

// @desc    Upload file and ingest to RAG via n8n
// @route   POST /api/upload
// @access  Protected
exports.uploadFile = async (req, res) => {
  try {
    const file = req.file;

    // Check for file presence
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please attach a PDF.' });
    }

    // Since n8n in local mode usually handles the heavy lifting, we forward the buffer
    // using n8nService's FormData logic. We can also include the sessionId/userId context.
    const result = await sendFileToN8n(file, req.user.id);

    // Some n8n workflows return an ID or metadata
    res.status(200).json({
      success: true,
      data: {
        message: 'File uploaded and ingestion process started.',
        n8n_result: result,
        filename: file.originalname
      }
    });

  } catch (err) {
    console.error('Upload Controller Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server error while uploading RAG document.' });
  }
};
