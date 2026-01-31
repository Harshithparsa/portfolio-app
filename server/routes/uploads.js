const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Profile } = require('../models'); // Sequelize model
const authAdminMiddleware = require('../middleware/authAdmin');
const sharp = require('sharp');
const router = express.Router();

// ============================================
// MULTER CONFIGURATION
// ============================================

const uploadDirs = ['server/uploads/profile', 'server/uploads/docs'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'server/uploads/profile/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const docsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'server/uploads/docs/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const fieldName = req.body.type || 'document';
    cb(null, fieldName + '-' + uniqueSuffix + ext);
  }
});

const profileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPG, PNG, and WEBP images are allowed for profile photo'));
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'));
};

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

const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'FILE_TOO_LARGE') return res.status(400).json({ error: 'File too large', message: 'File size must not exceed 5MB' });
    if (error.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ error: 'Too many files', message: 'Only one file is allowed per upload' });
  }
  if (error && error.message) return res.status(400).json({ error: 'Upload failed', message: error.message });
  next();
};

async function cropProfileImage(inputPath, outputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;
  const cropHeight = Math.floor(width * 1.25);
  await image.extract({ left: 0, top: 0, width, height: Math.min(cropHeight, height) })
    .resize(400, 500)
    .toFile(outputPath);
}

// ============================================
// UPLOAD ROUTES
// ============================================

router.post('/profile-photo', authAdminMiddleware, uploadProfile.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded', message: 'Please select a file to upload' });

    const inputPath = req.file.path;
    const outputPath = path.join(path.dirname(inputPath), 'cropped-' + req.file.filename);

    try {
      await cropProfileImage(inputPath, outputPath);
    } catch (sharpError) {
      console.warn('Image cropping failed, using original:', sharpError);
      fs.copyFileSync(inputPath, outputPath);
    }

    // Attempt to remove original if different
    if (fs.existsSync(inputPath)) {
      try { fs.unlinkSync(inputPath); } catch (e) { }
    }

    const fileUrl = `/uploads/profile/${path.basename(outputPath)}`;

    let profile = await Profile.findOne();
    if (profile) await profile.update({ profileImage: fileUrl });
    else profile = await Profile.create({ profileImage: fileUrl });

    res.json({
      success: true,
      message: 'Profile photo uploaded and cropped successfully',
      url: fileUrl,
      filename: req.file.originalname
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) try { fs.unlinkSync(req.file.path); } catch (e) { }
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

router.post('/resume', authAdminMiddleware, uploadDocs.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded', message: 'Please select a PDF file to upload' });
    const fileUrl = `/uploads/docs/${req.file.filename}`;

    let profile = await Profile.findOne();
    if (profile) await profile.update({ resumeUrl: fileUrl });
    else profile = await Profile.create({ resumeUrl: fileUrl });

    res.json({ success: true, message: 'Resume uploaded successfully', url: fileUrl, filename: req.file.originalname });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) try { fs.unlinkSync(req.file.path); } catch (e) { }
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

router.post('/cv', authAdminMiddleware, uploadDocs.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded', message: 'Please select a PDF file to upload' });
    const fileUrl = `/uploads/docs/${req.file.filename}`;

    let profile = await Profile.findOne();
    if (profile) await profile.update({ cvUrl: fileUrl });
    else profile = await Profile.create({ cvUrl: fileUrl });

    res.json({ success: true, message: 'CV uploaded successfully', url: fileUrl, filename: req.file.originalname });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) try { fs.unlinkSync(req.file.path); } catch (e) { }
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

router.delete('/:type/:filename', authAdminMiddleware, async (req, res) => {
  try {
    const { type, filename } = req.params;
    if (!['profile', 'docs'].includes(type)) return res.status(400).json({ error: 'Invalid type' });

    const filePath = path.join(__dirname, `../../server/uploads/${type}/${filename}`);
    const uploadDir = path.resolve(__dirname, '../../server/uploads');

    if (!path.resolve(filePath).startsWith(uploadDir)) return res.status(403).json({ error: 'Forbidden' });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'Not found', message: 'File does not exist' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Delete failed', message: error.message });
  }
});

router.use(handleMulterError);

module.exports = router;
