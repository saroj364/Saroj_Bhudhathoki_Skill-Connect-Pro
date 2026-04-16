const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Course = require('../models/courseModel');
const Module = require('../models/modules');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('MONGO_URI not defined');
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);

    console.log("MongoDB Connected\n");

  } catch (error) {

    console.error("DB Connection Error:", error.message);
    process.exit(1);

  }
};

const seedModules = async () => {

  try {

    await Module.deleteMany();
    console.log("Old modules removed");

    const courses = await Course.find();

    const modules = [];

    for (const course of courses) {

      let courseModules = [];

      if (course.title.includes("Full Stack JavaScript")) {

        courseModules = [
          "Introduction to JavaScript",
          "Node.js & Express Fundamentals",
          "Working with MongoDB",
          "Building REST APIs",
          "React Frontend Integration"
        ];

      } else if (course.title.includes("Backend")) {

        courseModules = [
          "Advanced Node.js Concepts",
          "Authentication & JWT Security",
          "Scalable API Architecture",
          "Caching & Performance Optimization",
          "Microservices & Deployment"
        ];

      } else if (course.title.includes("React")) {

        courseModules = [
          "Introduction to React",
          "Components & Props",
          "React Hooks & State Management",
          "Routing with React Router",
          "Building a Full React Project"
        ];

      } else if (course.title.includes("DevOps")) {

        courseModules = [
          "Introduction to DevOps",
          "Docker & Containerization",
          "CI/CD with GitHub Actions",
          "Cloud Deployment Strategies",
          "Monitoring & Scaling Applications"
        ];

      } else if (course.title.includes("Cybersecurity")) {

        courseModules = [
          "Introduction to Cybersecurity",
          "OWASP Top 10 Vulnerabilities",
          "Penetration Testing Basics",
          "Exploitation & Security Tools",
          "Securing Web Applications"
        ];

      } else if (course.title.includes("MongoDB")) {

        courseModules = [
          "Introduction to MongoDB",
          "Schema Design & Data Modeling",
          "Indexes & Query Optimization",
          "Aggregation Pipeline",
          "Scaling MongoDB Applications"
        ];

      }

      courseModules.forEach((title, index) => {

        modules.push({
          course_id: course._id,
          title: title,
          progressPoint: 20
        });

      });

    }

    await Module.insertMany(modules);

    console.log(`Modules seeded successfully!`);
    console.log(`Total Modules Created: ${modules.length}`);

    await mongoose.connection.close();

    console.log("Database connection closed");

    process.exit(0);

  } catch (error) {

    console.error("Seeding Error:", error.message);

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }

    process.exit(1);

  }

};

connectDB().then(seedModules);