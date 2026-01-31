require('dotenv').config();
const { Profile, Project, SkillCategory, Achievement } = require('./server/models');
const sequelize = require('./server/database/db');

const sampleProjects = [
    {
        title: "E-Commerce Platform",
        description: "A full-featured e-commerce platform built with MERN stack. Includes user authentication, product search, cart functionality, and payment gateway integration.",
        tags: ["React", "Node.js", "MongoDB", "Redux"],
        imageUrl: "",
        githubLink: "https://github.com/example/ecommerce",
        liveLink: "https://ecommerce-demo.com",
        featured: true
    },
    {
        title: "Task Management App",
        description: "A collaborative task management tool with real-time updates using Socket.io. Features drag-and-drop interface and team workspaces.",
        tags: ["Vue.js", "Express", "Socket.io", "Firebase"],
        imageUrl: "",
        githubLink: "https://github.com/example/taskmanager",
        liveLink: "https://task-app-demo.com",
        featured: true
    },
    {
        title: "Social Media Dashboard",
        description: "Analytics dashboard for social media accounts. Visualizes data using D3.js and provides automated reporting features.",
        tags: ["React", "D3.js", "Node.js", "PostgreSQL"],
        imageUrl: "",
        githubLink: "https://github.com/example/social-dashboard",
        liveLink: "https://dashboard-demo.com",
        featured: false
    },
    {
        title: "Weather Forecast App",
        description: "Responsive weather application fetching real-time data from OpenWeatherMap API. Features geolocation and 5-day forecast.",
        tags: ["JavaScript", "HTML5", "CSS3", "API"],
        imageUrl: "",
        githubLink: "https://github.com/example/weather-app",
        liveLink: "https://weather-demo.com",
        featured: false
    }
];

const sampleAchievements = [
    {
        date: "2025",
        title: "Best Developer Award",
        detail: "Recognized as the top performer in the annual company hackathon for innovative solutions."
    },
    {
        date: "2024",
        title: "Open Source Contributor",
        detail: "Active contributor to major open source projects including React and Node.js ecosystems."
    },
    {
        date: "2023",
        title: "Certified AWS Architect",
        detail: "Achieved AWS Solutions Architect Associate certification with a score of 950/1000."
    },
    {
        date: "2022",
        title: "Tech Speaker",
        detail: "Keynote speaker at regional tech conference discussing the future of web development."
    }
];

async function seedData() {
    try {
        await sequelize.sync({ force: true }); // Reset DB
        console.log('Database synced');

        // Create Profile
        await Profile.create({
            name: 'Harshith',
            tagline: 'Full-Stack Developer & MERN Specialist',
            about: 'Building high-performance web applications',
            email: 'admin@parsa.dev',
            socials: {
                github: 'https://github.com',
                linkedin: 'https://linkedin.com',
                twitter: 'https://twitter.com',
                portfolio: 'https://parsa.dev'
            }
        });
        console.log('Profile seeded');

        // Create Projects
        await Project.bulkCreate(sampleProjects);
        console.log('Projects seeded');

        // Create Achievements
        await Achievement.bulkCreate(sampleAchievements);
        console.log('Achievements seeded');

        // Create Skills (Sample)
        await SkillCategory.create({
            category: "Frontend",
            items: ["HTML", "CSS", "JavaScript", "React", "Vue"]
        });
        await SkillCategory.create({
            category: "Backend",
            items: ["Node.js", "Express", "Python", "SQL"]
        });
        console.log('Skills seeded');

        console.log('✅ Successfully seeded SQL database.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
