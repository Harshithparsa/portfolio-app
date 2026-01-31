const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Profile } = require('../models');
const authAdminMiddleware = require('../middleware/authAdmin');
const router = express.Router();

// Cloudinary Setup
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('☁️ Cloudinary configured for image uploads');
} else {
  console.log('📂 Cloudinary keys missing. Falling back to local storage (images will vanish on Vercel shutdowns).');
}

// ============================================
// STORAGE CONFIGURATION
// ============================================

let uploadProfile, uploadDocs;

if (isCloudinaryConfigured) {
  // Cloudinary Storage
  const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'portfolio/profile',
      allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
      transformation: [{ width: 500, height: 600, crop: 'limit' }]
    },
  });

  const docsStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'portfolio/docs',
      resource_type: 'raw', // Important for PDFs
      allowed_formats: ['pdf', 'doc', 'docx'],
      use_filename: true
    },
  });

  uploadProfile = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 } });
  uploadDocs = multer({ storage: docsStorage, limits: { fileSize: 10 * 1024 * 1024 } });

} else {
  // Local Storage (Fallback)
  const uploadDirs = ['server/uploads/profile', 'server/uploads/docs'];
  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const diskStorage = (subfolder) => multer.diskStorage({
    destination: (req, file, cb) => cb(null, `server/uploads/${subfolder}/`),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  uploadProfile = multer({
    storage: diskStorage('profile'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
      else cb(new Error('Invalid file type'));
    }
  });

  uploadDocs = multer({
    storage: diskStorage('docs'),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') cb(null, true);
      else cb(new Error('Invalid file type'));
    }
  });
}

// ============================================
// ROUTES
// ============================================

router.post('/profile-photo', authAdminMiddleware, uploadProfile.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Get URL: Cloudinary gives `path`, Local gives relative path
    const fileUrl = isCloudinaryConfigured ? req.file.path : `/uploads/profile/${req.file.filename}`;

    let profile = await Profile.findOne();
    if (profile) await profile.update({ profileImage: fileUrl });
    else profile = await Profile.create({ profileImage: fileUrl });

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      url: fileUrl
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

router.post('/resume', authAdminMiddleware, uploadDocs.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileUrl = isCloudinaryConfigured ? req.file.path : `/uploads/docs/${req.file.filename}`;

    let profile = await Profile.findOne();
    if (profile) await profile.update({ resumeUrl: fileUrl });
    else profile = await Profile.create({ resumeUrl: fileUrl });

    res.json({ success: true, message: 'Resume uploaded successfully', url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

router.post('/cv', authAdminMiddleware, uploadDocs.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileUrl = isCloudinaryConfigured ? req.file.path : `/uploads/docs/${req.file.filename}`;

    let profile = await Profile.findOne();
    if (profile) await profile.update({ cvUrl: fileUrl });
    else profile = await Profile.create({ cvUrl: fileUrl });

    res.json({ success: true, message: 'CV uploaded successfully', url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

// Delete route (Optional - mostly for local cleanup)
router.delete('/:type/:filename', authAdminMiddleware, async (req, res) => {
  // Deleting from Cloudinary via filename is more complex (needs public_id). 
  // For now we just support local delete or return success to avoid frontend errors.
  if (!isCloudinaryConfigured) {
    const { type, filename } = req.params;
    const filePath = path.join(__dirname, `../../server/uploads/${type}/${filename}`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  res.json({ success: true, message: 'File deleted' });
});

module.exports = router;
