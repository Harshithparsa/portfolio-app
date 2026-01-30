const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Portfolio = require('../models/Portfolio');
const authAdminMiddleware = require('../middleware/authAdmin');
const sharp = require('sharp');
const router = express.Router();

// ============================================
// MULTER CONFIGURATION
// ============================================

// Create uploads directories if they don't exist
const uploadDirs = ['server/uploads/profile', 'server/uploads/docs'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Separate storage configurations for different file types
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/profile/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random + extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const docsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/docs/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const fieldName = req.body.type || 'document';
    cb(null, fieldName + '-' + uniqueSuffix + ext);
  }
});

// File filter for profile photos
const profileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed for profile photo'));
  }
};

// File filter for PDFs
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Multer instances with size limits (5MB = 5 * 1024 * 1024)
const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: profileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadDocs = multer({
  storage: docsStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================

const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must not exceed 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Only one file is allowed per upload'
      });
    }
  }
  if (error && error.message) {
    return res.status(400).json({
      error: 'Upload failed',
      message: error.message
    });
  }
  next();
};

// Helper to crop image for face (centered, cut top)
async function cropProfileImage(inputPath, outputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;
  // Crop: keep width, crop from top to make a square (or 4:5 portrait)
  const cropHeight = Math.floor(width * 1.25); // 4:5 ratio
  const top = 0;
  await image.extract({ left: 0, top, width, height: Math.min(cropHeight, height) })
    .resize(400, 500)
    .toFile(outputPath);
}

// ============================================
// UPLOAD ROUTES
// ============================================

/**
 * POST /api/uploads/profile-photo
 * Upload profile photo with JWT protection
 */
router.post('/profile-photo', authAdminMiddleware, uploadProfile.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }
    // Crop and process the image
    const inputPath = req.file.path;
    const outputPath = path.join(path.dirname(inputPath), 'cropped-' + req.file.filename);
    await cropProfileImage(inputPath, outputPath);
    // Optionally, remove the original file and use only cropped
    fs.unlinkSync(inputPath);
    const fileUrl = `/uploads/profile/${path.basename(outputPath)}`;

    // Update portfolio with new profile photo URL
    // NOTE: The public site reads `profile.profileImage` (nested), not a top-level `profileImage`.
    const portfolio = await Portfolio.findOneAndUpdate(
      {},
      {
        $set: {
          'profile.profileImage': fileUrl,
          updatedAt: Date.now()
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Profile photo uploaded and cropped successfully',
      url: fileUrl,
      filename: req.file.originalname
    });
  } catch (error) {
    // Clean up uploaded file if database update fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete file:', err);
      });
    }
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

/**
 * POST /api/uploads/resume
 * Upload resume PDF with JWT protection
 */
router.post('/resume', authAdminMiddleware, uploadDocs.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a PDF file to upload'
      });
    }

    const fileUrl = `/uploads/docs/${req.file.filename}`;

    // Update portfolio with new resume URL (nested under `profile`)
    const portfolio = await Portfolio.findOneAndUpdate(
      {},
      {
        $set: {
          'profile.resumeUrl': fileUrl,
          updatedAt: Date.now()
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      url: fileUrl,
      filename: req.file.originalname
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete file:', err);
      });
    }
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

/**
 * POST /api/uploads/cv
 * Upload CV PDF with JWT protection
 */
router.post('/cv', authAdminMiddleware, uploadDocs.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a PDF file to upload'
      });
    }

    const fileUrl = `/uploads/docs/${req.file.filename}`;

    // Update portfolio with new CV URL (nested under `profile`)
    const portfolio = await Portfolio.findOneAndUpdate(
      {},
      {
        $set: {
          'profile.cvUrl': fileUrl,
          updatedAt: Date.now()
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'CV uploaded successfully',
      url: fileUrl,
      filename: req.file.originalname
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete file:', err);
      });
    }
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

/**
 * DELETE /api/uploads/:type/:filename
 * Delete uploaded file (optional cleanup)
 */
router.delete('/:type/:filename', authAdminMiddleware, async (req, res) => {
  try {
    const { type, filename } = req.params;
    const validTypes = ['profile', 'docs'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Invalid type',
        message: 'Type must be "profile" or "docs"'
      });
    }

    const filePath = path.join(__dirname, `../../server/uploads/${type}/${filename}`);

    // Security: ensure file is within uploads directory
    const uploadDir = path.resolve(__dirname, '../../server/uploads');
    if (!path.resolve(filePath).startsWith(uploadDir)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Cannot delete file outside uploads directory'
      });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        error: 'Not found',
        message: 'File does not exist'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Delete failed',
      message: error.message
    });
  }
});

// Apply multer error handler
router.use(handleMulterError);

module.exports = router;
