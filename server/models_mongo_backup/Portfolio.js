const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  // Profile Information
  profile: {
    name: { type: String, default: 'Harshith' },
    tagline: { type: String, default: 'Full-Stack Developer & MERN Specialist' },
    about: { type: String, default: 'Building high-performance web applications' },
    email: { type: String, default: 'admin@parsa.dev' },
    phone: { type: String, default: '+91 9014975103' },
    location: { type: String, default: 'India' },
    profileImage: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    cvUrl: { type: String, default: '' },
    socials: {
      github: { type: String, default: 'https://github.com' },
      linkedin: { type: String, default: 'https://linkedin.com' },
      twitter: { type: String, default: 'https://twitter.com' },
      portfolio: { type: String, default: 'https://parsa.dev' }
    }
  },
  
  // Skills
  skills: [
    {
      category: String,
      items: [String]
    }
  ],
  
  // Certificates
  certificates: [
    {
      title: String,
      issuer: String,
      date: String,
      link: String,
      badgeIcon: String
    }
  ],
  
  // Projects
  projects: [
    {
      title: String,
      description: String,
      tags: [String],
      imageUrl: String,
      githubLink: String,
      liveLink: String,
      featured: Boolean
    }
  ],
  
  // Achievements
  achievements: [
    {
      date: String,
      title: String,
      detail: String
    }
  ],
  
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
