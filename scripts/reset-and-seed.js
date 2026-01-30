const mongoose = require('mongoose');
const Portfolio = require('../server/models/Portfolio');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio-db';

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
      github: 'https://github.com/harshith',
      linkedin: 'https://linkedin.com/in/harshith',
      twitter: 'https://twitter.com/harshith',
      portfolio: 'https://parsa.dev'
    }
  },

  skills: [
    {
      category: 'Frontend Development',
      items: ['React.js', 'Next.js', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Material UI']
    },
    {
      category: 'Backend Development',
      items: ['Node.js', 'Express.js', 'MongoDB', 'MySQL', 'PostgreSQL', 'RESTful APIs', 'GraphQL', 'JWT Authentication']
    },
    {
      category: 'Tools & Technologies',
      items: ['Git', 'Docker', 'AWS', 'Firebase', 'Webpack', 'Babel', 'Postman', 'VS Code']
    }
  ],

  projects: [
    {
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce application with payment integration, product management, and user authentication. Built with MERN stack.',
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      imageUrl: 'https://via.placeholder.com/400x300?text=E-Commerce',
      githubLink: 'https://github.com/harshith/ecommerce',
      liveLink: 'https://ecommerce-demo.com',
      featured: true
    },
    {
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates, team collaboration features, and progress tracking.',
      tags: ['React', 'Firebase', 'Material-UI', 'Redux'],
      imageUrl: 'https://via.placeholder.com/400x300?text=Task+Manager',
      githubLink: 'https://github.com/harshith/task-manager',
      liveLink: 'https://task-manager-demo.com',
      featured: true
    },
    {
      title: 'Analytics Dashboard',
      description: 'Real-time analytics dashboard with data visualization, user analytics tracking, and custom report generation.',
      tags: ['React', 'D3.js', 'Node.js', 'PostgreSQL'],
      imageUrl: 'https://via.placeholder.com/400x300?text=Analytics',
      githubLink: 'https://github.com/harshith/analytics-dashboard',
      liveLink: 'https://analytics-demo.com',
      featured: false
    },
    {
      title: 'Weather App',
      description: 'A weather application that provides real-time weather data, forecasts, and beautiful UI with animations.',
      tags: ['React', 'API Integration', 'GSAP', 'CSS3'],
      imageUrl: 'https://via.placeholder.com/400x300?text=Weather+App',
      githubLink: 'https://github.com/harshith/weather-app',
      liveLink: 'https://weather-app-demo.com',
      featured: false
    },
    {
      title: 'Blog Platform',
      description: 'A modern blogging platform with markdown support, comment system, and SEO optimization.',
      tags: ['Next.js', 'MongoDB', 'Markdown', 'SEO'],
      imageUrl: 'https://via.placeholder.com/400x300?text=Blog+Platform',
      githubLink: 'https://github.com/harshith/blog-platform',
      liveLink: 'https://blog-demo.com',
      featured: false
    },
    {
      title: 'Chat Application',
      description: 'Real-time chat application with user authentication, group chats, and message notifications.',
      tags: ['React', 'Socket.io', 'Node.js', 'MongoDB'],
      imageUrl: 'https://via.placeholder.com/400x300?text=Chat+App',
      githubLink: 'https://github.com/harshith/chat-app',
      liveLink: 'https://chat-demo.com',
      featured: false
    },
    {
      title: 'Video Streaming Platform',
      description: 'Video streaming platform with adaptive bitrate streaming, user subscriptions, and content management.',
      tags: ['React', 'HLS', 'AWS S3', 'Node.js'],
      imageUrl: 'https://via.placeholder.com/400x300?text=Video+Streaming',
      githubLink: 'https://github.com/harshith/video-streaming',
      liveLink: 'https://video-demo.com',
      featured: false
    },
    {
      title: 'Portfolio Builder',
      description: 'A web-based portfolio builder that allows users to create stunning portfolios with customizable templates.',
      tags: ['React', 'Drag-Drop', 'Templates', 'Export'],
      imageUrl: 'https://via.placeholder.com/400x300?text=Portfolio+Builder',
      githubLink: 'https://github.com/harshith/portfolio-builder',
      liveLink: 'https://portfolio-builder-demo.com',
      featured: false
    }
  ],

  certificates: [
    {
      title: 'Full Stack Web Development with MERN',
      issuer: 'Udemy',
      date: '2023-06',
      link: 'https://udemy.com/cert',
      badgeIcon: 'https://via.placeholder.com/100?text=MERN'
    },
    {
      title: 'JavaScript Mastery',
      issuer: 'JavaScript.info',
      date: '2023-03',
      link: 'https://javascript.info/cert',
      badgeIcon: 'https://via.placeholder.com/100?text=JS'
    },
    {
      title: 'React Advanced Patterns',
      issuer: 'Frontend Masters',
      date: '2023-05',
      link: 'https://frontendmasters.com/cert',
      badgeIcon: 'https://via.placeholder.com/100?text=React'
    },
    {
      title: 'MongoDB University',
      issuer: 'MongoDB',
      date: '2023-04',
      link: 'https://university.mongodb.com/cert',
      badgeIcon: 'https://via.placeholder.com/100?text=MongoDB'
    },
    {
      title: 'AWS Cloud Practitioner',
      issuer: 'Amazon Web Services',
      date: '2023-08',
      link: 'https://aws.amazon.com/cert',
      badgeIcon: 'https://via.placeholder.com/100?text=AWS'
    }
  ],

  achievements: [
    {
      date: '2020-01',
      title: 'Started Web Development Journey',
      detail: 'Began learning web development and built my first website using HTML, CSS, and JavaScript.'
    },
    {
      date: '2020-06',
      title: 'First Freelance Project',
      detail: 'Completed my first freelance project - a responsive website for a local business.'
    },
    {
      date: '2021-01',
      title: 'Learned React.js',
      detail: 'Mastered React.js and built several interactive web applications with complex state management.'
    },
    {
      date: '2021-09',
      title: 'Completed MERN Stack',
      detail: 'Completed full-stack development training and built a complete MERN application from scratch.'
    },
    {
      date: '2022-06',
      title: 'Reached 1000+ GitHub Stars',
      detail: 'One of my open-source projects reached 1000+ stars on GitHub, gaining community recognition.'
    },
    {
      date: '2023-03',
      title: 'Lead Developer Role',
      detail: 'Promoted to Lead Developer role, managing a team of 5 developers and overseeing multiple projects.'
    }
  ]
};

async function seedPortfolio() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Delete existing portfolio
    await Portfolio.deleteMany({});
    console.log('Cleared existing portfolio data');

    // Insert new portfolio
    const newPortfolio = new Portfolio(DUMMY_PORTFOLIO);
    await newPortfolio.save();
    console.log('✓ Portfolio seeded successfully!');
    console.log(`  - Profile: ${newPortfolio.profile.name}`);
    console.log(`  - Skills: ${newPortfolio.skills.length} categories`);
    console.log(`  - Projects: ${newPortfolio.projects.length} projects`);
    console.log(`  - Certificates: ${newPortfolio.certificates.length} certificates`);
    console.log(`  - Achievements: ${newPortfolio.achievements.length} milestones`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding portfolio:', error);
    process.exit(1);
  }
}

seedPortfolio();
