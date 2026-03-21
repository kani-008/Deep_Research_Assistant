// ./backend/routes/uploadRoutes.js

const express = require('express');
const multer = require('multer');
const { uploadFile, getUploadHistory, getUploadById, deleteUpload } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { uploadLimiter } = require('../middleware/securityMiddleware');

const router = express.Router();

// Setup Multer to handle PDF memory buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs are allowed for RAG ingestion'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All upload routes are protected
router.use(protect);

// Upload file with rate limiting
router.post('/', uploadLimiter, upload.single('file'), uploadFile);

// Upload management
router.get('/', getUploadHistory);
router.get('/:uploadId', getUploadById);
router.delete('/:uploadId', deleteUpload);

module.exports = router;
