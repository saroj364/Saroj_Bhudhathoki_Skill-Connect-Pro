const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
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

const seedUsers = async () => {

  try {

    await User.deleteMany();
    console.log('Old users removed');
    const admin = await User.create({
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
      isApproved: true
    });

    console.log('Admin created');

    const users = [
      {
        username: 'instructor1',
        email: 'instructor1@gmail.com',
        password: 'instructor123',
        role: 'instructor',
        bio: 'Full stack developer and coding mentor.',
        skills: ['Node.js', 'React', 'MongoDB'],
        location: 'Remote',
        experienceLevel: 'expert',
        rating: 4.8,
        totalReviews: 120,
        completedJobs: 45,
        earnings: 12000,
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: admin._id
      },
      {
        username: 'freelancer1',
        email: 'freelancer1@gmail.com',
        password: 'freelancer123',
        role: 'freelancer',
        bio: 'Freelance backend developer specializing in scalable APIs.',
        skills: ['Node.js', 'Express', 'REST APIs', 'MySQL'],
        location: 'Remote',
        experienceLevel: 'expert',
        hourlyRate: 35,
        rating: 4.7,
        totalReviews: 86,
        completedJobs: 60,
        activeJobs: 3,
        earnings: 18000,
        points: 850,
        level: 4,
        badges: ['Top Rated', 'API Expert'],
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: admin._id
      },
      {
        username: 'client1',
        email: 'client1@gmail.com',
        password: 'client123',
        role: 'client',
        bio: 'Startup founder looking to hire skilled developers.',
        location: 'USA',
        points: 20,
        level: 1,
        isApproved: true
      },
      {
        username: 'freelancer2',
        email: 'freelancer2@gmail.com',
        password: 'freelancer123',
        role: 'freelancer',
        bio: 'Frontend developer specializing in React & UI/UX.',
        skills: ['React', 'Tailwind', 'Next.js', 'UI Design'],
        location: 'Canada',
        experienceLevel: 'intermediate',
        hourlyRate: 28,
        rating: 4.5,
        totalReviews: 40,
        completedJobs: 30,
        activeJobs: 2,
        earnings: 9000,
        points: 520,
        level: 3,
        badges: ['UI Specialist'],
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: admin._id
      }

    ];

    for (const userData of users) {
      const user = await User.create(userData);
      console.log(`Created ${user.role}: ${user.email}`);

    }

    console.log('\nUsers seeded successfully!\n');
    console.log('Default Credentials:');
    console.log('-----------------------------------');
    console.log('ADMIN → admin@gmail.com / admin123');
    console.log('INSTRUCTOR → instructor1@gmail.com / instructor123');
    console.log('FREELANCER → freelancer1@gmail.com / freelancer123');
    console.log('CLIENT → client1@gmail.com / client123');
    console.log('-----------------------------------');
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err.message);
    if (err.code === 11000) {
      console.error('Duplicate key error');
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
    process.exit(1);
  }
};

connectDB().then(seedUsers);