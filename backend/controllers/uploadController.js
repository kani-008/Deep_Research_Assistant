// ./backend/controllers/uploadController.js

const { sendFileToN8n } = require('../services/n8nService');
const Upload = require('../models/Upload');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { createErrors } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Upload PDF file for RAG ingestion
 * POST /api/v1/upload
 * Enhanced: Tracks upload metadata and ingestion status
 */
exports.uploadFile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(createErrors.badRequest('No file uploaded. Please attach a PDF.'));
  }

  if (req.file.mimetype !== 'application/pdf') {
    return next(createErrors.badRequest('Only PDF files are allowed'));
  }

  if (req.file.size > 10 * 1024 * 1024) {
    return next(createErrors.badRequest('File size exceeds 10MB limit'));
  }

  try {
    const startTime = Date.now();

    // Create upload record with pending status
    const upload = await Upload.create({
      userId: req.user._id,
      filename: `${Date.now()}-${req.file.originalname}`,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'processing'
    });

    logger.info('Upload processing started', {
      uploadId: upload._id,
      userId: req.user._id,
      filename: req.file.originalname
    });

    // Send to n8n for ingestion
    const n8nResponse = await sendFileToN8n(req.file, req.user._id);

    const processingTime = Date.now() - startTime;

    // Update upload record with results
    if (n8nResponse.success) {
      upload.status = 'completed';
      upload.ingestionMetadata = n8nResponse.data?.metadata || {
        processingTimeMs: processingTime,
        n8nWorkflowId: n8nResponse.data?.workflowId
      };
      await upload.save();

      logger.info('Upload completed successfully', {
        uploadId: upload._id,
        processingTime
      });

      return res.status(200).json({
        success: true,
        message: 'File uploaded and ingested successfully.',
        data: {
          uploadId: upload._id,
          filename: upload.originalName,
          status: upload.status,
          processingTime
        }
      });
    } else {
      // n8n workflow failed or is not reachable
      upload.status = 'failed';
      upload.errorDetails = {
        message: n8nResponse.message || 'n8n ingestion workflow failed',
        code: n8nResponse.error || 'N8N_ERROR',
        timestamp: new Date()
      };
      await upload.save();

      logger.error('n8n ingestion failed', {
        uploadId: upload._id,
        reason: n8nResponse.message,
        hint: 'Check that the Ingestion Workflow is Published in n8n and the webhook URL in .env is correct'
      });

      // Return a clear error so the frontend can show a proper failure message
      return next(createErrors.serverError(
        n8nResponse.message || 'File upload failed: ingestion workflow not reachable. Is your n8n Ingestion Workflow published?'
      ));
    }
  } catch (error) {
    logger.error('Upload error', {
      userId: req.user._id,
      filename: req.file.originalname,
      error: error.message
    });

    return next(createErrors.serverError('Failed to upload file'));
  }
});

/**
 * Get upload history with pagination
 * GET /api/v1/uploads?page=1&limit=20
 */
exports.getUploadHistory = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  try {
    const history = await Upload.getUploadHistory(req.user._id, parseInt(page), parseInt(limit));

    logger.info('Upload history retrieved', {
      userId: req.user._id,
      count: history.data.length
    });

    res.status(200).json({
      success: true,
      data: history.data,
      pagination: history.pagination
    });
  } catch (error) {
    logger.error('Error retrieving upload history', { error: error.message });
    return next(createErrors.serverError('Failed to retrieve upload history'));
  }
});

/**
 * Get upload by ID
 * GET /api/v1/uploads/:uploadId
 */
exports.getUploadById = asyncHandler(async (req, res, next) => {
  const { uploadId } = req.params;

  const upload = await Upload.findOne({
    _id: uploadId,
    userId: req.user._id
  });

  if (!upload) {
    return next(createErrors.notFound('Upload not found'));
  }

  // Log access
  await upload.logAccess('viewed');

  res.status(200).json({
    success: true,
    data: upload
  });
});

/**
 * Delete upload
 * DELETE /api/v1/uploads/:uploadId
 */
exports.deleteUpload = asyncHandler(async (req, res, next) => {
  const { uploadId } = req.params;

  const upload = await Upload.findOneAndDelete({
    _id: uploadId,
    userId: req.user._id
  });

  if (!upload) {
    return next(createErrors.notFound('Upload not found'));
  }

  logger.info('Upload deleted', {
    uploadId,
    userId: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Upload deleted successfully'
  });
});