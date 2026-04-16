/**
 * Script to create an admin user
 * Run this script: node scripts/createAdmin.js
 * 
 * Or use: npm run create-admin
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/userModel');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('Error: MONGO_URI is not defined in environment variables');
      console.error('Please create a .env file in the Backend directory with: MONGO_URI=your_mongodb_connection_string');
      process.exit(1);
    }

    console.log('Attempting to connect to MongoDB...');
    
    // Use same connection options as server.js for consistency
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 1
    });
    
    console.log('[+] Connected to MongoDB successfully');

    // Default admin credentials
    const adminData = {
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: adminData.email },
        { username: adminData.username }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      
      // Option to update existing user to admin
      if (existingAdmin.role !== 'admin') {
        console.log('User exists but is not admin. Updating to admin role...');
        existingAdmin.role = 'admin';
        existingAdmin.password = adminData.password; // Will be hashed by pre-save hook
        await existingAdmin.save();
        console.log('[+] Updated existing user to admin role');
        console.log('\n Admin Credentials:');
        console.log('   Email:', adminData.email);
        console.log('   Username:', existingAdmin.username);
        console.log('   Password:', adminData.password);
        console.log('   Role:', existingAdmin.role);
        console.log('\n Please change the password after first login!');
      } else {
        console.log('   Email:', existingAdmin.email);
        console.log('   Username:', existingAdmin.username);
        console.log('   Role:', existingAdmin.role);
        console.log('\nAdmin user already exists with these credentials');
        console.log('   To reset password, update the user in database or delete and recreate');
      }
      
      // Verify admin was created/updated
      const verifyAdmin = await User.findOne({ email: adminData.email }).select('+password');
      if (verifyAdmin && verifyAdmin.role === 'admin') {
        console.log('\n Verification: Admin user confirmed in database');
      }
    } else {
      // Create new admin user
      console.log('   Creating new admin user...');
      console.log('   Username:', adminData.username);
      console.log('   Email:', adminData.email);
      console.log('   Role:', adminData.role);
      
      const admin = await User.create(adminData);
      console.log('✓ Admin user created successfully!');
      
      // Verify the admin was created
      const verifyAdmin = await User.findById(admin._id);
      if (verifyAdmin) {
        console.log('\n Admin Credentials:');
        console.log('   ID:', verifyAdmin._id);
        console.log('   Username:', verifyAdmin.username);
        console.log('   Email:', verifyAdmin.email);
        console.log('   Password:', adminData.password, '(stored as hashed)');
        console.log('   Role:', verifyAdmin.role);
        console.log('   Created:', verifyAdmin.createdAt);
        console.log('\nVerification: Admin user confirmed in database');
        console.log('\nIMPORTANT: Change the password after first login!');
      } else {
        console.log(' Warning: Could not verify admin creation');
      }
    }

    await mongoose.connection.close();
    console.log('\n Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n Error creating admin user:');
    console.error('   Message:', error.message);
    
    if (error.code === 11000) {
      console.error('     Duplicate key error - User with this email or username already exists');
    }
    
    if (error.name === 'ValidationError') {
      console.error('     Validation error:', Object.values(error.errors).map(e => e.message).join(', '));
    }
    
    console.error('\n   Full error:', error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✓ Database connection closed');
    }
    process.exit(1);
  }
};

// Run the script
createAdmin();

