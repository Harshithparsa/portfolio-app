const mongoose = require('mongoose');
const Portfolio = require('../server/models/Portfolio');
require('dotenv').config();

const DUMMY_PORTFOLIO = {
  profile: {
    name: 'Harshith',
    tagline: 'Full-Stack Developer & MERN Specialist',
    about: 'I am a passionate full-stack developer with 3+ years of experience building scalable web applications. Specialized in MERN stack with expertise in creating efficient, responsive, and user-centric solutions that solve real-world problems.',
    email: 'admin@parsa.dev',
    phone: '+91 9014975103',
    location: 'India',
    profileImage: '',
    resumeUrl: '',
    cvUrl: '',
    socials: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com/in/harshith',
      twitter: 'https://twitter.com',
      portfolio: 'https://parsa.dev'
    }
  },

  skills: [
    {
      category: 'Frontend',
      items: ['React.js', 'Vue.js', 'JavaScript ES6+', 'HTML5', 'CSS3', 'Responsive Design', 'GSAP', 'Redux']
    },
    {
      category: 'Backend',
      items: ['Node.js', 'Express.js', 'RESTful APIs', 'JWT Authentication', 'MongoDB', 'Mongoose', 'Error Handling']
    },
    {
      category: 'Tools & Services',
      items: ['Git & GitHub', 'Postman', 'Firebase', 'Docker', 'AWS S3', 'Vercel', 'Railway', 'MongoDB Atlas']
    }
  ],

  certificates: [
    {
      title: 'Full Stack Web Development with MERN',
      issuer: 'Udemy',
      date: '2023',
      link: 'https://udemy.com/certificate/example1',
      badgeIcon: '🏆'
    },
    {
      title: 'Advanced JavaScript Mastery',
      issuer: 'Coursera',
      date: '2023',
      link: 'https://coursera.org/certificate/example2',
      badgeIcon: '⭐'
    },
    {
      title: 'React.js Complete Guide',
      issuer: 'Udemy',
      date: '2022',
      link: 'https://udemy.com/certificate/example3',
      badgeIcon: '🎓'
    },
    {
      title: 'MongoDB Fundamentals',
      issuer: 'MongoDB University',
      date: '2022',
      link: 'https://mongodb.com/certificate/example4',
      badgeIcon: '💾'
    },
    {
      title: 'AWS Solutions Architect Associate',
      issuer: 'Amazon Web Services',
      date: '2023',
      link: 'https://aws.amazon.com/certificate/example5',
      badgeIcon: '☁️'
    }
  ],

  projects: [
    {
      title: 'E-Commerce Platform',
      description: 'Full-featured e-commerce platform with product catalog, shopping cart, payment gateway integration, and admin panel for inventory management.',
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redux'],
      imageUrl: '',
      githubLink: 'https://github.com/harshith/ecommerce',
      liveLink: 'https://ecommerce-demo.vercel.app',
      featured: true
    },
    {
      title: 'Task Management Dashboard',
      description: 'Collaborative task management tool with real-time updates, user authentication, task categorization, and progress tracking using Socket.io.',
      tags: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'JWT'],
      imageUrl: '',
      githubLink: 'https://github.com/harshith/taskmanager',
      liveLink: 'https://taskmanager-app.netlify.app',
      featured: true
    },
    {
      title: 'Social Media Analytics Dashboard',
      description: 'Analytics dashboard for tracking social media metrics with real-time data visualization, charts, and performance insights.',
      tags: ['React', 'Express', 'MongoDB', 'Chart.js', 'API Integration'],
      imageUrl: '',
      githubLink: 'https://github.com/harshith/analytics',
      liveLink: 'https://analytics-dashboard.vercel.app',
      featured: false
    },
    {
      title: 'Weather Forecast App',
      description: 'Real-time weather application with location-based forecasts, multiple weather APIs integration, and beautiful UI with weather animations.',
      tags: ['React', 'Weather API', 'Geolocation', 'Chart.js'],
      imageUrl: '',
      githubLink: 'https://github.com/harshith/weather',
      liveLink: 'https://weatherapp-demo.netlify.app',
      featured: false
    },
    {
      title: 'Blog Platform with CMS',
      description: 'Content management system for blogging with markdown support, SEO optimization, comment system, and admin panel for content creation.',
      tags: ['Next.js', 'Node.js', 'MongoDB', 'Markdown', 'SEO'],
      imageUrl: '',
      githubLink: 'https://github.com/harshith/blog',
      liveLink: 'https://blog-platform.vercel.app',
      featured: true
    },
    {
      title: 'Real-Time Chat Application',
      description: 'Messaging application with real-time communication, user authentication, typing indicators, and message persistence.',
      tags: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'JWT'],
      imageUrl: '',
      githubLink: 'https://github.com/harshith/chat',
      liveLink: 'https://chat-app-demo.netlify.app',
      featured: true
    },
    {
      title: 'Video Streaming Platform',
      description: 'Video streaming platform with upload capabilities, adaptive quality streaming, user subscriptions, and watch history tracking.',
      tags: ['React', 'Node.js', 'MongoDB', 'FFmpeg', 'AWS S3'],
      imageUrl: '',
      githubLink: 'https://github.com/harshith/streaming',
      liveLink: 'https://video-streaming-demo.vercel.app',
      featured: false
    },
    {
      title: 'Portfolio Website Builder',
      description: 'No-code portfolio builder allowing users to create professional portfolios with templates, custom domains, and SEO optimization.',
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Custom Domains'],
      imageUrl: '',
      githubLink: 'https://github.com/harshith/portfolio-builder',
      liveLink: 'https://portfolio-builder.vercel.app',
      featured: false
    }
  ],

  achievements: [
    {
      date: '2023',
      title: 'Full Stack Developer Certification',
      detail: 'Completed comprehensive MERN stack development course with 100+ hours of practical projects and real-world applications.'
    },
    {
      date: '2023',
      title: '25+ Projects Completed',
      detail: 'Successfully delivered 25+ web development projects ranging from small websites to large-scale applications for diverse clients.'
    },
    {
      date: '2022',
      title: 'AWS Solutions Architect Certified',
      detail: 'Passed AWS Solutions Architect Associate exam, demonstrating expertise in designing scalable cloud-based applications.'
    },
    {
      date: '2022',
      title: 'Open Source Contributor',
      detail: 'Contributed to multiple open-source projects including React.js libraries, gaining experience in collaborative development.'
    },
    {
      date: '2021',
      title: 'Started Freelance Development',
      detail: 'Launched freelance development career, building applications for startups and enterprises with focus on quality and innovation.'
    },
    {
      date: '2020',
      title: 'Web Development Journey Began',
      detail: 'Started learning web development with focus on JavaScript, gained expertise in frontend and backend technologies.'
    }
  ]
};

async function seedPortfolio() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio');
    console.log('Connected to MongoDB');

    // Check if portfolio already exists
    const existingPortfolio = await Portfolio.findOne();
    
    if (existingPortfolio) {
      console.log('✓ Portfolio data already exists. Skipping seed.');
      process.exit(0);
    }

    // Insert dummy portfolio data
    const newPortfolio = new Portfolio(DUMMY_PORTFOLIO);
    await newPortfolio.save();
    
    console.log('✓ Portfolio seeded successfully with dummy data!');
    console.log(`\nProfile: ${newPortfolio.profile.name}`);
    console.log(`Skills: ${newPortfolio.skills.length} categories`);
    console.log(`Projects: ${newPortfolio.projects.length} projects`);
    console.log(`Certificates: ${newPortfolio.certificates.length} certificates`);
    console.log(`Achievements: ${newPortfolio.achievements.length} milestones`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding portfolio:', error);
    process.exit(1);
  }
}

seedPortfolio();
