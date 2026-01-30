const express = require('express');
const router = express.Router();
const emailService = require('../services/email');

// Initialize email service on first contact
let emailInitialized = false;

// POST: Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Log the message
    console.log('📧 New Contact Form Submission:');
    console.log(`  From: ${name} (${email})`);
    if (phone) console.log(`  Phone: ${phone}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Message: ${message}`);
    console.log('---');

    // Initialize email service if not done yet
    if (!emailInitialized) {
      await emailService.initialize();
      emailInitialized = true;
    }

    // Prepare contact data
    const contactData = {
      name,
      email,
      subject,
      message,
      phone: phone || null
    };

    // Send contact email to admin
    await emailService.sendContactEmail(contactData);

    // Send confirmation email to visitor
    await emailService.sendConfirmationEmail(email, name);

    // Send admin alert
    await emailService.sendAdminAlert(contactData);

    res.status(200).json({
      success: true,
      message: 'Message received! I will get back to you soon. Check your email for confirmation.'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing your message. Please try again.'
    });
  }
});

module.exports = router;
module.exports = router;

