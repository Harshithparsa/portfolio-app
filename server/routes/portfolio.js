const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // For profile image: allow images only
    if (file.fieldname === 'profileImage') {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type for profile image. Use JPEG, PNG, GIF, or WEBP.'));
      }
    }
    // For resume and CV: allow PDF and documents
    else if (file.fieldname === 'resume' || file.fieldname === 'cv') {
      const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type for ' + file.fieldname + '. Use PDF or Word document.'));
      }
    } else {
      cb(null, true);
    }
  }
});

// ==================== Authentication Middleware ====================
const authAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // Accept tokens with either userId or id field
    if (!(decoded.id || decoded.userId)) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.userId = decoded.id || decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

// ==================== PUBLIC ROUTES ====================

// GET /api/portfolio/public/profile - Fetch public portfolio profile
router.get('/public/profile', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    
    // Return public profile data (sanitize admin fields)
    res.json({
      profile: portfolio.profile,
      skills: portfolio.skills,
      certificates: portfolio.certificates,
      projects: portfolio.projects,
      achievements: portfolio.achievements
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
  }
});

// GET /api/portfolio/public/:field - Fetch specific field (profile, skills, projects, etc.)
router.get('/public/:field', async (req, res) => {
  try {
    const { field } = req.params;
    const allowedFields = ['profile', 'skills', 'certificates', 'projects', 'achievements'];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field requested' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({ [field]: portfolio[field] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching field', error: error.message });
  }
});

// POST /api/portfolio/contact - Contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // TODO: Save contact message to database or send email
    console.log('Contact form submission:', { name, email, subject, message });

    res.json({ 
      message: 'Thank you for your message! I will get back to you soon.',
      success: true 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing contact form', error: error.message });
  }
});

// POST /api/portfolio/track - Analytics tracking
router.post('/track', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    // TODO: Save analytics data
    console.log('Analytics event:', { event, data, timestamp: new Date() });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking event', error: error.message });
  }
});

// ==================== ADMIN ROUTES (JWT Protected) ====================

// GET /api/admin/portfolio - Fetch complete portfolio for editing
router.get('/admin/portfolio', authAdmin, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
  }
});

// PUT /api/admin/portfolio - Update portfolio profile
router.put('/admin/portfolio', authAdmin, async (req, res) => {
  try {
    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({ message: 'Profile data is required' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Update profile fields
    Object.assign(portfolio.profile, profile);
    portfolio.updatedAt = new Date();

    await portfolio.save();

    res.json({ 
      message: 'Profile updated successfully', 
      profile: portfolio.profile 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// POST /api/admin/portfolio/skills - Add skill
router.post('/admin/portfolio/skills', authAdmin, async (req, res) => {
  try {
    const { category, items } = req.body;

    if (!category || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Category and items array are required' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Check if category already exists
    const existingCategory = portfolio.skills.find(s => s.category === category);
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    portfolio.skills.push({ category, items });
    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.status(201).json({ 
      message: 'Skill category added successfully', 
      skills: portfolio.skills 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding skill', error: error.message });
  }
});

// PUT /api/admin/portfolio/skills/:categoryId - Update skill category
router.put('/admin/portfolio/skills/:categoryId', authAdmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { category, items } = req.body;

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const skillIndex = portfolio.skills.findIndex(s => s._id.toString() === categoryId);
    if (skillIndex === -1) {
      return res.status(404).json({ message: 'Skill category not found' });
    }

    if (category) portfolio.skills[skillIndex].category = category;
    if (items && Array.isArray(items)) portfolio.skills[skillIndex].items = items;

    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Skill category updated successfully', 
      skills: portfolio.skills 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating skill', error: error.message });
  }
});

// DELETE /api/admin/portfolio/skills/:categoryId - Delete skill category
router.delete('/admin/portfolio/skills/:categoryId', authAdmin, async (req, res) => {
  try {
    const { categoryId } = req.params;

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.skills = portfolio.skills.filter(s => s._id.toString() !== categoryId);
    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Skill category deleted successfully', 
      skills: portfolio.skills 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting skill', error: error.message });
  }
});

// POST /api/admin/portfolio/projects - Add project
router.post('/admin/portfolio/projects', authAdmin, async (req, res) => {
  try {
    const { title, description, tags, imageUrl, githubLink, liveLink, featured } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.projects.push({
      title,
      description,
      tags: tags || [],
      imageUrl: imageUrl || '',
      githubLink: githubLink || '',
      liveLink: liveLink || '',
      featured: featured || false
    });

    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.status(201).json({ 
      message: 'Project added successfully', 
      projects: portfolio.projects 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding project', error: error.message });
  }
});

// PUT /api/admin/portfolio/projects/:projectId - Update project
router.put('/admin/portfolio/projects/:projectId', authAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, tags, imageUrl, githubLink, liveLink, featured } = req.body;

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const projectIndex = portfolio.projects.findIndex(p => p._id.toString() === projectId);
    if (projectIndex === -1) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = portfolio.projects[projectIndex];
    if (title) project.title = title;
    if (description) project.description = description;
    if (tags) project.tags = tags;
    if (imageUrl) project.imageUrl = imageUrl;
    if (githubLink) project.githubLink = githubLink;
    if (liveLink) project.liveLink = liveLink;
    if (typeof featured !== 'undefined') project.featured = featured;

    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Project updated successfully', 
      projects: portfolio.projects 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

// DELETE /api/admin/portfolio/projects/:projectId - Delete project
router.delete('/admin/portfolio/projects/:projectId', authAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.projects = portfolio.projects.filter(p => p._id.toString() !== projectId);
    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Project deleted successfully', 
      projects: portfolio.projects 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

// POST /api/admin/portfolio/certificates - Add certificate
router.post('/admin/portfolio/certificates', authAdmin, async (req, res) => {
  try {
    const { title, issuer, date, link, badgeIcon } = req.body;

    if (!title || !issuer) {
      return res.status(400).json({ message: 'Title and issuer are required' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.certificates.push({
      title,
      issuer,
      date: date || new Date(),
      link: link || '',
      badgeIcon: badgeIcon || ''
    });

    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.status(201).json({ 
      message: 'Certificate added successfully', 
      certificates: portfolio.certificates 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding certificate', error: error.message });
  }
});

// PUT /api/admin/portfolio/certificates/:certificateId - Update certificate
router.put('/admin/portfolio/certificates/:certificateId', authAdmin, async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { title, issuer, date, link, badgeIcon } = req.body;

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const certIndex = portfolio.certificates.findIndex(c => c._id.toString() === certificateId);
    if (certIndex === -1) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const cert = portfolio.certificates[certIndex];
    if (title) cert.title = title;
    if (issuer) cert.issuer = issuer;
    if (date) cert.date = date;
    if (link) cert.link = link;
    if (badgeIcon) cert.badgeIcon = badgeIcon;

    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Certificate updated successfully', 
      certificates: portfolio.certificates 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating certificate', error: error.message });
  }
});

// DELETE /api/admin/portfolio/certificates/:certificateId - Delete certificate
router.delete('/admin/portfolio/certificates/:certificateId', authAdmin, async (req, res) => {
  try {
    const { certificateId } = req.params;

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.certificates = portfolio.certificates.filter(c => c._id.toString() !== certificateId);
    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Certificate deleted successfully', 
      certificates: portfolio.certificates 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting certificate', error: error.message });
  }
});

// POST /api/admin/portfolio/achievements - Add achievement
router.post('/admin/portfolio/achievements', authAdmin, async (req, res) => {
  try {
    const { date, title, detail } = req.body;

    if (!date || !title) {
      return res.status(400).json({ message: 'Date and title are required' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.achievements.push({
      date,
      title,
      detail: detail || ''
    });

    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.status(201).json({ 
      message: 'Achievement added successfully', 
      achievements: portfolio.achievements 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding achievement', error: error.message });
  }
});

// PUT /api/admin/portfolio/achievements/:achievementId - Update achievement
router.put('/admin/portfolio/achievements/:achievementId', authAdmin, async (req, res) => {
  try {
    const { achievementId } = req.params;
    const { date, title, detail } = req.body;

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const achvIndex = portfolio.achievements.findIndex(a => a._id.toString() === achievementId);
    if (achvIndex === -1) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    const achv = portfolio.achievements[achvIndex];
    if (date) achv.date = date;
    if (title) achv.title = title;
    if (detail) achv.detail = detail;

    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Achievement updated successfully', 
      achievements: portfolio.achievements 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating achievement', error: error.message });
  }
});

// DELETE /api/admin/portfolio/achievements/:achievementId - Delete achievement
router.delete('/admin/portfolio/achievements/:achievementId', authAdmin, async (req, res) => {
  try {
    const { achievementId } = req.params;

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.achievements = portfolio.achievements.filter(a => a._id.toString() !== achievementId);
    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Achievement deleted successfully', 
      achievements: portfolio.achievements 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting achievement', error: error.message });
  }
});

// ==================== BULK UPDATE ROUTES (JWT Protected) ====================

// PUT /api/portfolio/admin/skills - Bulk update all skills
router.put('/admin/skills', authAdmin, async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: 'Skills must be an array' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.skills = skills;
    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Skills updated successfully', 
      skills: portfolio.skills 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating skills', error: error.message });
  }
});

// PUT /api/portfolio/admin/certificates - Bulk update all certificates
router.put('/admin/certificates', authAdmin, async (req, res) => {
  try {
    const { certificates } = req.body;

    if (!Array.isArray(certificates)) {
      return res.status(400).json({ message: 'Certificates must be an array' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.certificates = certificates;
    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Certificates updated successfully', 
      certificates: portfolio.certificates 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating certificates', error: error.message });
  }
});

// PUT /api/portfolio/admin/projects - Bulk update all projects
router.put('/admin/projects', authAdmin, async (req, res) => {
  try {
    const { projects } = req.body;

    if (!Array.isArray(projects)) {
      return res.status(400).json({ message: 'Projects must be an array' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.projects = projects;
    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Projects updated successfully', 
      projects: portfolio.projects 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating projects', error: error.message });
  }
});

// PUT /api/portfolio/admin/achievements - Bulk update all achievements
router.put('/admin/achievements', authAdmin, async (req, res) => {
  try {
    const { achievements } = req.body;

    if (!Array.isArray(achievements)) {
      return res.status(400).json({ message: 'Achievements must be an array' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.achievements = achievements;
    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Achievements updated successfully', 
      achievements: portfolio.achievements 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating achievements', error: error.message });
  }
});

// ==================== FILE UPLOAD ROUTES (JWT Protected) ====================

// POST /api/admin/upload/profile-image - Upload profile picture
router.post('/admin/upload/profile-image', authAdmin, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Delete old file if exists
    if (portfolio.profile.profileImage) {
      const oldFilePath = path.join(__dirname, '../uploads', path.basename(portfolio.profile.profileImage));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    portfolio.profile.profileImage = fileUrl;
    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Profile image uploaded successfully', 
      imageUrl: fileUrl,
      profile: portfolio.profile 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading profile image', error: error.message });
  }
});

// POST /api/admin/upload/resume - Upload resume
router.post('/admin/upload/resume', authAdmin, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Delete old file if exists
    if (portfolio.profile.resumeUrl) {
      const oldFilePath = path.join(__dirname, '../uploads', path.basename(portfolio.profile.resumeUrl));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    portfolio.profile.resumeUrl = fileUrl;
    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'Resume uploaded successfully', 
      resumeUrl: fileUrl,
      profile: portfolio.profile 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading resume', error: error.message });
  }
});

// POST /api/admin/upload/cv - Upload CV
router.post('/admin/upload/cv', authAdmin, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Delete old file if exists
    if (portfolio.profile.cvUrl) {
      const oldFilePath = path.join(__dirname, '../uploads', path.basename(portfolio.profile.cvUrl));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    portfolio.profile.cvUrl = fileUrl;
    portfolio.updatedAt = new Date();
    await portfolio.save();

    res.json({ 
      message: 'CV uploaded successfully', 
      cvUrl: fileUrl,
      profile: portfolio.profile 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading CV', error: error.message });
  }
});

module.exports = router;
