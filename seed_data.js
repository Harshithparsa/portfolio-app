require('dotenv').config();
const mongoose = require('mongoose');
const Portfolio = require('./server/models/Portfolio');

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
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is missing in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
            console.error('No portfolio found! Please create a profile first.');
            process.exit(1);
        }

        console.log('Seeding Projects...');
        portfolio.projects = sampleProjects;

        console.log('Seeding Achievements...');
        portfolio.achievements = sampleAchievements;

        portfolio.markModified('projects');
        portfolio.markModified('achievements');

        await portfolio.save();
        console.log('Successfully seeded database with sample data.');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedData();
