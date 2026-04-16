const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Course = require('../models/courseModel');
const User = require('../models/userModel');

const connectDB = async () => {
  try {

    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('MONGO_URI not defined in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    console.log('MongoDB Connected\n');

  } catch (err) {

    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);

  }
};

const seedCourses = async () => {

  try {

    const instructor = await User.findOne({ role: 'instructor' });

    if (!instructor) {
      console.error('No instructor found. Run seedUsers first.');
      process.exit(1);
    }

    await Course.deleteMany();
    console.log('Old courses removed');

    const courses = [

      {
        instructor_id: instructor._id,
        title: "Full Stack JavaScript Bootcamp",
        description:
          "Master full stack development using Node.js, Express, MongoDB and React by building real world applications.",
        duration: 4,
        price: 199,
        category: "web development",
        level: "beginner",
        thumbnail: "https://placehold.co/600x400",
        isPublished: true
      },

      {
        instructor_id: instructor._id,
        title: "Advanced Backend Engineering",
        description:
          "Learn scalable backend architecture, authentication, caching, and performance optimization with Node.js.",
        duration: 3,
        price: 249,
        category: "backend",
        level: "advanced",
        thumbnail: "https://placehold.co/600x400",
        isPublished: true
      },

      {
        instructor_id: instructor._id,
        title: "React Frontend Development",
        description:
          "Build modern responsive interfaces using React, Hooks, Context API and Tailwind CSS.",
        duration: 2,
        price: 179,
        category: "frontend",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400",
        isPublished: true
      },

      {
        instructor_id: instructor._id,
        title: "DevOps & CI/CD Fundamentals",
        description:
          "Learn Docker, GitHub Actions, CI/CD pipelines and automated deployment workflows.",
        duration: 2,
        price: 189,
        category: "devops",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400",
        isPublished: true
      },

      {
        instructor_id: instructor._id,
        title: "Cybersecurity & Ethical Hacking",
        description:
          "Learn penetration testing, vulnerability scanning and OWASP Top 10 exploitation techniques.",
        duration: 4,
        price: 299,
        category: "cybersecurity",
        level: "advanced",
        thumbnail: "https://placehold.co/600x400",
        isPublished: true
      },

      {
        instructor_id: instructor._id,
        title: "MongoDB & Database Design",
        description:
          "Learn schema design, indexing, aggregation pipelines and performance optimization in MongoDB.",
        duration: 2,
        price: 149,
        category: "database",
        level: "intermediate",
        thumbnail: "https://placehold.co/600x400",
        isPublished: true
      }

    ];

    await Course.insertMany(courses);

    console.log('Courses seeded successfully!');
    console.log(`Instructor: ${instructor.email}`);
    console.log(`Total Courses Created: ${courses.length}`);

    await mongoose.connection.close();

    console.log('Database connection closed');

    process.exit(0);

  } catch (err) {

    console.error('Seeding Error:', err.message);

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }

    process.exit(1);

  }
};

connectDB().then(seedCourses);