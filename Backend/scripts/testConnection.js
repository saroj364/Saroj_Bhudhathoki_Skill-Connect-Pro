const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('Error: MONGO_URI is not defined');
      console.error('Create a .env file with: MONGO_URI=your_connection_string');
      process.exit(1);
    }

    console.log('   Testing MongoDB connection...');
    console.log('   URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); 

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });
    console.log('   Connection successful!');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    console.log('   Ready State:', mongoose.connection.readyState);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n Collections:', collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None');

    await mongoose.connection.close();
    console.log('\n  Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n Connection failed:');
    console.error('   Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

testConnection();

