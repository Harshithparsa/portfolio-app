const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const {
  Profile,
  SkillCategory,
  Project,
  Certificate,
  Achievement
} = require('../models');

// ==================== Multer Configuration ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Invalid file type for profile image.'));
    } else if (file.fieldname === 'resume' || file.fieldname === 'cv') {
      const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedMimes.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Invalid file type for document.'));
    } else {
      cb(null, true);
    }
  }
});

// ==================== Authentication Middleware ====================
const authAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (!(decoded.id || decoded.userId)) return res.status(403).json({ message: 'Invalid token' });

    req.userId = decoded.id || decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

// ==================== PUBLIC ROUTES ====================

// GET /api/portfolio/public/profile - Fetch all
router.get('/public/profile', async (req, res) => {
  try {
    const profile = await Profile.findOne() || {};
    const skills = await SkillCategory.findAll();
    const certificates = await Certificate.findAll();
    const projects = await Project.findAll();
    const achievements = await Achievement.findAll();

    res.json({
      profile,
      skills,
      certificates,
      projects,
      achievements
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
  }
});

// GET /api/portfolio/public/:field
router.get('/public/:field', async (req, res) => {
  try {
    const { field } = req.params;
    let data;

    switch (field) {
      case 'profile': data = await Profile.findOne(); break;
      case 'skills': data = await SkillCategory.findAll(); break;
      case 'certificates': data = await Certificate.findAll(); break;
      case 'projects': data = await Project.findAll(); break;
      case 'achievements': data = await Achievement.findAll(); break;
      default: return res.status(400).json({ message: 'Invalid field' });
    }

    res.json({ [field]: data || (Array.isArray(data) ? [] : {}) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching field', error: error.message });
  }
});

router.post('/contact', async (req, res) => {
  res.json({ message: 'Thank you for your message!', success: true });
});

router.post('/track', async (req, res) => {
  res.json({ success: true });
});

// ==================== ADMIN ROUTES ====================

// GET /api/admin/portfolio - Fetch complete portfolio
router.get('/admin/portfolio', authAdmin, async (req, res) => {
  try {
    const profile = await Profile.findOne() || {};
    const skills = await SkillCategory.findAll();
    const certificates = await Certificate.findAll();
    const projects = await Project.findAll();
    const achievements = await Achievement.findAll();

    // Construct object to match expected frontend format
    res.json({
      profile,
      skills,
      certificates,
      projects,
      achievements
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
  }
});

// PUT /api/admin/portfolio - Update profile
router.put('/admin/portfolio', authAdmin, async (req, res) => {
  try {
    const { profile } = req.body;
    let userProfile = await Profile.findOne();

    if (userProfile) {
      await userProfile.update(profile);
    } else {
      userProfile = await Profile.create(profile);
    }

    res.json({ message: 'Profile updated', profile: userProfile });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// SKILLS
router.post('/admin/portfolio/skills', authAdmin, async (req, res) => {
  try {
    const skill = await SkillCategory.create(req.body);
    const skills = await SkillCategory.findAll();
    res.status(201).json({ message: 'Skill added', skills });
  } catch (error) {
    res.status(500).json({ message: 'Error adding skill', error: error.message });
  }
});

router.put('/admin/portfolio/skills/:id', authAdmin, async (req, res) => {
  try {
    await SkillCategory.update(req.body, { where: { id: req.params.id } });
    const skills = await SkillCategory.findAll();
    res.json({ message: 'Skill updated', skills });
  } catch (error) {
    res.status(500).json({ message: 'Error updating skill', error: error.message });
  }
});

router.delete('/admin/portfolio/skills/:id', authAdmin, async (req, res) => {
  try {
    await SkillCategory.destroy({ where: { id: req.params.id } });
    const skills = await SkillCategory.findAll();
    res.json({ message: 'Skill deleted', skills });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting skill', error: error.message });
  }
});

// PROJECTS
router.post('/admin/portfolio/projects', authAdmin, async (req, res) => {
  try {
    await Project.create(req.body);
    const projects = await Project.findAll();
    res.status(201).json({ message: 'Project added', projects });
  } catch (error) {
    res.status(500).json({ message: 'Error adding project', error: error.message });
  }
});

router.put('/admin/portfolio/projects/:id', authAdmin, async (req, res) => {
  try {
    await Project.update(req.body, { where: { id: req.params.id } });
    const projects = await Project.findAll();
    res.json({ message: 'Project updated', projects });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

router.delete('/admin/portfolio/projects/:id', authAdmin, async (req, res) => {
  try {
    await Project.destroy({ where: { id: req.params.id } });
    const projects = await Project.findAll();
    res.json({ message: 'Project deleted', projects });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

// CERTIFICATES
router.post('/admin/portfolio/certificates', authAdmin, async (req, res) => {
  try {
    await Certificate.create(req.body);
    const certificates = await Certificate.findAll();
    res.status(201).json({ message: 'Certificate added', certificates });
  } catch (error) {
    res.status(500).json({ message: 'Error adding certificate', error: error.message });
  }
});

router.put('/admin/portfolio/certificates/:id', authAdmin, async (req, res) => {
  try {
    await Certificate.update(req.body, { where: { id: req.params.id } });
    const certificates = await Certificate.findAll();
    res.json({ message: 'Certificate updated', certificates });
  } catch (error) {
    res.status(500).json({ message: 'Error updating certificate', error: error.message });
  }
});

router.delete('/admin/portfolio/certificates/:id', authAdmin, async (req, res) => {
  try {
    await Certificate.destroy({ where: { id: req.params.id } });
    const certificates = await Certificate.findAll();
    res.json({ message: 'Certificate deleted', certificates });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting certificate', error: error.message });
  }
});

// ACHIEVEMENTS
router.post('/admin/portfolio/achievements', authAdmin, async (req, res) => {
  try {
    await Achievement.create(req.body);
    const achievements = await Achievement.findAll();
    res.status(201).json({ message: 'Achievement added', achievements });
  } catch (error) {
    res.status(500).json({ message: 'Error adding achievement', error: error.message });
  }
});

router.put('/admin/portfolio/achievements/:id', authAdmin, async (req, res) => {
  try {
    await Achievement.update(req.body, { where: { id: req.params.id } });
    const achievements = await Achievement.findAll();
    res.json({ message: 'Achievement updated', achievements });
  } catch (error) {
    res.status(500).json({ message: 'Error updating achievement', error: error.message });
  }
});

router.delete('/admin/portfolio/achievements/:id', authAdmin, async (req, res) => {
  try {
    await Achievement.destroy({ where: { id: req.params.id } });
    const achievements = await Achievement.findAll();
    res.json({ message: 'Achievement deleted', achievements });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting achievement', error: error.message });
  }
});

// BULK UPDATES
router.put('/admin/skills', authAdmin, async (req, res) => {
  try {
    await SkillCategory.destroy({ truncate: true });
    if (req.body.skills && req.body.skills.length > 0) {
      await SkillCategory.bulkCreate(req.body.skills);
    }
    const skills = await SkillCategory.findAll();
    res.json({ message: 'Skills updated', skills });
  } catch (error) {
    res.status(500).json({ message: 'Error updating skills', error: error.message });
  }
});

router.put('/admin/projects', authAdmin, async (req, res) => {
  try {
    await Project.destroy({ truncate: true });
    if (req.body.projects && req.body.projects.length > 0) {
      await Project.bulkCreate(req.body.projects);
    }
    const projects = await Project.findAll();
    res.json({ message: 'Projects updated', projects });
  } catch (error) {
    res.status(500).json({ message: 'Error updating projects', error: error.message });
  }
});

// UPLOADS
router.post('/admin/upload/profile-image', authAdmin, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileUrl = `/uploads/${req.file.filename}`;
    let profile = await Profile.findOne();
    if (profile) {
      await profile.update({ profileImage: fileUrl });
    } else {
      profile = await Profile.create({ profileImage: fileUrl });
    }

    res.json({ message: 'Profile image uploaded', imageUrl: fileUrl, profile });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading profile image', error: error.message });
  }
});

// Implement other uploads similarly if needed (resume, cv), omitting for brevity unless requested
router.post('/admin/upload/resume', authAdmin, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    let profile = await Profile.findOne();
    if (profile) await profile.update({ resumeUrl: fileUrl });
    else profile = await Profile.create({ resumeUrl: fileUrl });
    res.json({ message: 'Resume uploaded', resumeUrl: fileUrl, profile });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading resume', error: error.message });
  }
});

router.post('/admin/upload/cv', authAdmin, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    let profile = await Profile.findOne();
    if (profile) await profile.update({ cvUrl: fileUrl });
    else profile = await Profile.create({ cvUrl: fileUrl });
    res.json({ message: 'CV uploaded', cvUrl: fileUrl, profile });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading CV', error: error.message });
  }
});

module.exports = router;
