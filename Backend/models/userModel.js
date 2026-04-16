  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');

  const progressSchema = new mongoose.Schema({
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },
    completedModules: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Module",
      default: []
    },
    progressPercent: {
      type: Number,
      default: 0
    }
  }, { _id: false });

  const userSchema = new mongoose.Schema({

    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ['admin', 'freelancer', 'instructor', 'client'],
      default: 'client'
    },

    profileImage: {
      type: String,
      default: ''
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },

    skills: {
      type: [String],
      default: []
    },

    location: {
      type: String,
      default: ''
    },

    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'beginner'
    },

    hourlyRate: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 0
    },

    totalReviews: {
      type: Number,
      default: 0
    },

    completedJobs: {
      type: Number,
      default: 0
    },

    activeJobs: {
      type: Number,
      default: 0
    },

    earnings: {
      type: Number,
      default: 0
    },

    courseProgress: [progressSchema],

    points: {
      type: Number,
      default: 0
    },

    level: {
      type: Number,
      default: 1
    },

    badges: {
      type: [String],
      default: []
    },

    // Approval system
    isApproved: {
      type: Boolean,
      default: true
    },

    approvedAt: {
      type: Date,
      default: null
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }

  }, {
    timestamps: true
  });


  // Hash password
  userSchema.pre('save', async function(next) {

    if (!this.isModified('password')) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();

  });


  // Password check
  userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };


  // Role helpers
  userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
  };

  userSchema.methods.isFreelancer = function() {
    return this.role === 'freelancer';
  };

  userSchema.methods.isInstructor = function() {
    return this.role === 'instructor';
  };

  userSchema.methods.isClient = function() {
    return this.role === 'client';
  };


  const User = mongoose.model('User', userSchema);

  module.exports = User;