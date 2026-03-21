// ./backend/controllers/uploadController.js

const { sendFileToN8n, deleteFileFromN8n } = require('../services/n8nService');
const Upload = require('../models/Upload');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { createErrors } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Upload PDF file for RAG ingestion
 * POST /api/v1/uploads
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

    const n8nResponse = await sendFileToN8n(req.file, req.user._id);
    const processingTime = Date.now() - startTime;

    if (n8nResponse.success) {
      // driveFileId is now extracted in n8nService from the Ingestion Workflow response
      const driveFileId = n8nResponse.driveFileId;
      const driveFileName = n8nResponse.driveFileName || req.file.originalname;

      logger.info('Storing driveFileId in MongoDB', {
        uploadId: upload._id,
        driveFileId: driveFileId || 'NULL — fix Ingestion Workflow Respond to Webhook node'
      });

      upload.status = 'completed';
      upload.ingestionMetadata = {
        processingTimeMs: processingTime,
        driveFileId: driveFileId,
        driveFileName: driveFileName
      };
      await upload.save();

      return res.status(200).json({
        success: true,
        message: 'File uploaded and ingested successfully.',
        data: {
          uploadId: upload._id,
          filename: upload.originalName,
          status: upload.status,
          driveFileId: driveFileId,
          processingTime
        }
      });
    } else {
      upload.status = 'failed';
      upload.errorDetails = {
        message: n8nResponse.message || 'n8n ingestion workflow failed',
        code: n8nResponse.error || 'N8N_ERROR',
        timestamp: new Date()
      };
      await upload.save();

      logger.error('n8n ingestion failed', {
        uploadId: upload._id,
        reason: n8nResponse.message
      });

      return next(createErrors.serverError(
        n8nResponse.message || 'File upload failed: ingestion workflow not reachable.'
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
 * GET /api/v1/uploads
 */
exports.getUploadHistory = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  try {
    const history = await Upload.getUploadHistory(req.user._id, parseInt(page), parseInt(limit));
    logger.info('Upload history retrieved', { userId: req.user._id, count: history.data.length });
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
  const upload = await Upload.findOne({ _id: uploadId, userId: req.user._id });
  if (!upload) return next(createErrors.notFound('Upload not found'));
  await upload.logAccess('viewed');
  res.status(200).json({ success: true, data: upload });
});

/**
 * Delete upload — removes from Google Drive, Qdrant, and MongoDB
 * DELETE /api/v1/uploads/:uploadId
 */
exports.deleteUpload = asyncHandler(async (req, res, next) => {
  const { uploadId } = req.params;

  const upload = await Upload.findOne({ _id: uploadId, userId: req.user._id });
  if (!upload) return next(createErrors.notFound('Upload not found'));

  const driveFileId = upload.ingestionMetadata?.driveFileId;

  logger.info('Delete request received', {
    uploadId,
    filename: upload.originalName,
    driveFileId: driveFileId || 'NOT STORED'
  });

  let driveDeleted = false;

  if (driveFileId) {
    // Call n8n delete webhook → deletes from Google Drive + Qdrant
    const n8nResult = await deleteFileFromN8n(driveFileId, upload.originalName, req.user._id);
    if (n8nResult.success) {
      driveDeleted = true;
      logger.info('File deleted from Google Drive + Qdrant via n8n', { driveFileId });
    } else {
      logger.warn('n8n Drive deletion failed — removing from DB anyway', {
        uploadId,
        driveFileId,
        error: n8nResult.error
      });
    }
  } else {
    logger.warn('No driveFileId stored — skipping Drive deletion', {
      uploadId,
      filename: upload.originalName,
      hint: 'Re-upload this file to enable Drive sync deletion'
    });
  }

  // Always delete from MongoDB
  await Upload.findByIdAndDelete(uploadId);

  logger.info('Upload deleted from MongoDB', { uploadId, userId: req.user._id });

  res.status(200).json({
    success: true,
    driveDeleted,
    message: driveDeleted
      ? 'File deleted from Google Drive, Qdrant, and database.'
      : 'File removed from database. No Drive sync (re-upload to enable).'
  });
}); 