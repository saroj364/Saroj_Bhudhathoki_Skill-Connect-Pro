const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 
const { socketAuthMiddleware } = require('./middleware/authMiddleware');


dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin:"*",
  credentials: true 
}));
app.use(express.json());


// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

const connectDB = async (retries = 3) => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI is not defined in environment variables');
      console.error('Please create a .env file with: MONGO_URI=your_mongodb_connection_string');
      process.exit(1);
    }

    const mongoUri = process.env.MONGO_URI;
    if (mongoUri.includes('mongodb+srv://')) {
      console.log('Attempting to connect to MongoDB Atlas (SRV)...');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
      // DNS and network options
      //family: 4, // Force IPv4 (sometimes helps with DNS issues)
      // Additional options to help with DNS
      maxPoolSize: 10,
      minPoolSize: 1
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    if (retries > 0) {
      console.log(`\n⚠ Connection attempt failed. Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      return connectDB(retries - 1);
    }

    console.error('\n✗ MongoDB Connection Error:', error.message);
    console.error('\n🔧 Troubleshooting Solutions:');
    console.error('\n1. DNS Resolution Issue:');
    console.error('   - Try using standard connection string instead of mongodb+srv://');
    console.error('   - Get standard connection string from MongoDB Atlas:');
    console.error('     Connect → Drivers → Node.js → Standard Connection String');
    console.error('   - Format: mongodb://username:password@cluster0-shard-00-00.xxxxx.mongodb.net:27017/dbname?ssl=true');
    
    console.error('\n2. Network Access:');
    console.error('   - MongoDB Atlas → Network Access → Add IP Address');
    console.error('   - For development: Add 0.0.0.0/0 (allows all IPs)');
    
    console.error('\n3. Internet/Firewall:');
    console.error('   - Check if you can access: https://cloud.mongodb.com');
    console.error('   - Try different network (mobile hotspot)');
    console.error('   - Check if corporate firewall blocks MongoDB');
    
    console.error('\n4. Cluster Status:');
    console.error('   - Ensure cluster is running (not paused)');
    console.error('   - Check MongoDB Atlas dashboard');
    
    console.error('\n5. Connection String:');
    console.error('   - Verify username/password are correct');
    console.error('   - Check if database name exists');
    console.error('   - Ensure special characters in password are URL-encoded');
    
    console.error('\n Alternative: Use local MongoDB for development');
    console.error('   MONGO_URI=mongodb://localhost:27017/learnhub\n');
    
    // Don't exit process - allow server to run without DB for testing
    return false;
  }
};

connectDB();

// Routes
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');
const authRoutes = require('./routes/authRoute');
const adminRoutes = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courseRoutes'); 
const socketRoutes = require('./routes/socketRoutes'); 
const cartRoutes = require('./routes/cartRoutes');
const instructorRoutes = require('./routes/instructorRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notiRoutes = require('./routes/notiRoutes');
const freelancerRoutes = require('./routes/freelancerRoutes');

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses',courseRoutes); 
app.use('/api/cart',cartRoutes);
app.use('/api/instructor',instructorRoutes);
app.use('/api/payment',paymentRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/notifications',notiRoutes);
app.use('/api/freelancer',freelancerRoutes);
app.use('/uploads',express.static("uploads"));
// Basic route
app.get('/', (req, res) => {
  res.send('Skill Connect System API is running');
});


//http server
const server = http.createServer(app);
//cors
const io = new Server(server, {
  cors: {
    origin:"*",
    method: ["GET","POST"],
    credentials: true 
  },
});
app.set("io", io);
socketRoutes(io);

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});