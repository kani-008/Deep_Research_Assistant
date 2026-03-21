// ./backend/routes/uploadRoutes.js

const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

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

// Protected route for document upload
router.post('/', protect, upload.single('file'), (req, res, next) => {
  // Pass to controller
  uploadFile(req, res, next);
}, (err, req, res, next) => {
  // Handle multer errors
  res.status(400).json({ success: false, message: err.message });
});

module.exports = router;
