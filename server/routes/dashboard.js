const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF and Word documents are allowed'));
    }
  }
});

// Middleware to handle multer errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      success: false, 
      message: 'File upload error',
      error: err.message 
    });
  } else if (err) {
    return res.status(400).json({ 
      success: false, 
      message: 'Error processing file',
      error: err.message 
    });
  }
  next();
};

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // In a real app, you would fetch these from your database
    const stats = {
      totalViews: 24589,
      totalClicks: 3245,
      messages: 1287,
      downloads: 856,
      recentActivities: [
        {
          id: 1,
          type: 'project',
          title: 'New Project Added',
          description: 'E-commerce Dashboard was added to your portfolio',
          time: '2 hours ago',
          icon: 'file-alt'
        },
        // ... more activities
      ]
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats',
      error: error.message 
    });
  }
});

// Upload file
router.post('/upload', 
  upload.single('file'), 
  handleUploadErrors,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }

      const fileInfo = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
        uploadedAt: new Date()
      };

      // In a real app, you would save this file info to your database
      // await File.create(fileInfo);

      res.json({ 
        success: true, 
        message: 'File uploaded successfully',
        file: fileInfo
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload file',
        error: error.message 
      });
    }
  }
);

module.exports = router;
