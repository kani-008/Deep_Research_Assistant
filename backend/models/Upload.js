const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      unique: true
    },
    originalName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    ingestionMetadata: {
        processingTimeMs: Number,
        n8nWorkflowId: String,
        driveFileId: String,       // Google Drive file ID for deletion
        driveFileName: String      // Original name in Drive
    },
    errorDetails: {
      message: String,
      code: String,
      timestamp: Date
    },
    accessLogs: [
      {
        action: String, // 'uploaded', 'viewed', 'deleted'
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

// Compound index for efficient querying
uploadSchema.index({ userId: 1, createdAt: -1 });

/**
 * Log access attempts or modifications
 */
uploadSchema.methods.logAccess = async function (action) {
  this.accessLogs.push({ action });
  return this.save();
};

/**
 * Static method to get upload history with pagination
 */
uploadSchema.statics.getUploadHistory = async function (userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('originalName fileSize status createdAt'),
    this.countDocuments({ userId })
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = mongoose.model('Upload', uploadSchema);