const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExistsByEmail = await User.findOne({ email });
    if (userExistsByEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const userExistsByUsername = await User.findOne({ username });
    if (userExistsByUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // IMPORTANT: Admin role cannot be set during public registration for security
    const validRoles = ['freelancer', 'instructor', 'client'];
    let userRole = 'client'; 
    
    if (role && validRoles.includes(role.toLowerCase())) {
      userRole = role.toLowerCase();
    } else if (role && role.toLowerCase() === 'admin') {
      return res.status(403).json({ 
        message: 'Admin role cannot be assigned during registration. Please contact administrator.' 
      });
    }

    const isApproved = (userRole === 'admin' || userRole === 'client');
    
    const user = await User.create({
      username,
      email,
      password,
      role: userRole,
      isApproved: isApproved
    });

    if ((userRole === 'instructor' || userRole === 'freelancer') && !isApproved) {
      try {
        // Find all admin users
        const admins = await User.find({ role: 'admin' });
        
        const notifications = admins.map(admin => ({
          user: admin._id,
          type: userRole === 'instructor' ? 'INSTRUCTOR_REGISTRATION' : 'FREELANCER_REGISTRATION',
          title: `New ${userRole} Registration`,
          message: `${user.username} (${user.email}) has registered and is pending approval`,
          relatedUserId: user._id,
          isRead: false
        }));

        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      } catch (notificationError) {
        console.error('Error creating notifications:', notificationError);
      }
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        skills: user.skills,
        isApproved: user.isApproved,
        token: isApproved ? generateToken(user._id) : null // Only generate token if approved
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (user && (await user.matchPassword(password))) {
      if ((user.role === 'instructor' || user.role === 'freelancer') && !user.isApproved) {
        return res.status(403).json({ 
          message: 'Your account is pending approval from admin. Please wait for approval before logging in.',
          needsApproval: true
        });
      }

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        skills: user.skills,
        isApproved: user.isApproved,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };



