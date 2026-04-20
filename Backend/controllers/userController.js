const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const enrolled = require('../models/Enrollment');
const Job = require('../models/Job');
const Chat = require('../models/Chat');
const Message = require('../models/message');
const OnlineClass = require('../models/onlineClassModel');
const Course = require('../models/courseModel');
const Module = require('../models/modules');
const JobPayment = require('../models/jobPayment');
const ModuleProgress = require('../models/progress');
const transporter = require('../middleware/mail');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getUserCourse = async (req, res) => {
  try {
    const userId = req.user._id; 

    const enrollments = await enrolled.find({ user_id: userId }).lean();
    if (!enrollments.length) return res.json({ success: true, data: [] });

    const courseIds = enrollments.map(en => en.course_id);
    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate('instructor_id', 'username') 
      .lean();

    const modules = await Module.find({ course_id: { $in: courseIds } }).lean();

    const moduleIds = modules.map(m => m._id);
    const moduleProgresses = await ModuleProgress.find({
      user_id: userId,
      module_id: { $in: moduleIds }
    }).lean();

    const moduleProgressMap = {};
    moduleProgresses.forEach(mp => {
      moduleProgressMap[mp.module_id.toString()] = mp.progressPoint || 0;
    });

    const formattedCourses = courses.map(course => {
      const courseModules = modules.filter(m => m.course_id.toString() === course._id.toString());

      let totalPoints = 0;
      let userPoints = 0;
      courseModules.forEach(mod => {
        totalPoints += mod.progressPoint || 0;
        userPoints += moduleProgressMap[mod._id.toString()] || 0;
      });

      const enrollment = enrollments.find(en => en.course_id.toString() === course._id.toString());

      const progressPercent = totalPoints > 0
        ? Math.round((userPoints / totalPoints) * 100)
        : (enrollment ? enrollment.progress : 0);

      const enrolledDate = enrollment?.createdAt ? new Date(enrollment.createdAt) : new Date();

      return {
        id: course._id,
        title: course.title,
        instructor: course.instructor_id?.username || 'Unknown',
        progress: progressPercent,
        enrolledDate, 
        status: enrollment?.status ? 'completed' : 'enrolled',
        image: course.thumbnail || '/default-course.png'
      };
    });

    res.json({ success: true, data: formattedCourses });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const getFreelancers = async (req, res) => {
  try {
    const freelancers = await User.find({
      role: "freelancer",
      isApproved: true
    }).select("-password -earnings -activeJobs");
    res.status(200).json({
      success: true,
      count: freelancers.length,
      data: freelancers
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to get freelancers"
    });

  }
};

const getFreelancerById = async (req, res) => {
  try {
    const freelancer = await User.findById(req.params.id).select("-password");
    res.status(200).json({
      success: true,
      data: freelancer
    });

  } catch (error) {
    res.status(500).json({
      success:false,
      message:"Failed to fetch freelancer"
    });

  }
};
const createJob = async (req, res) => {
  try {
    const clientId = req.user.id;
    const {
      freelancerId,
      title,
      description,
      hours,
      workType,
      budget
    } = req.body;
    const existingJob = await Job.findOne({
      client: clientId,
      freelancer: freelancerId,
      title,
      status: "pending" 
    });

    if (existingJob) {
      return res.status(400).json({
        success: false,
        message: "Job already exists"
      });
    }

    const job = await Job.create({
      client: clientId,
      freelancer: freelancerId,
      title,
      description,
      hours,
      workType,
      budget
    });

    let chat = await Chat.findOne({
      participants: { $all: [clientId, freelancerId] }
    });

    if (!chat) {
      chat = await Chat.create({
        job: job._id,
        participants: [clientId, freelancerId]
      });
    }

    const message = await Message.create({
      chat: chat._id,
      sender: clientId,
      type: "hire-request",
      payload: {
        title,
        description,
        hours,
        workType,
        budget
      },
      status: "pending"
    });

    job.chat = chat._id;
    await job.save();

    const io = req.app.get("io");
    io.to(chat._id.toString()).emit("receive-message", message);

    io.to(freelancerId.toString()).emit("new-hire-request", message);

    res.json({
      success: true,
      jobId: job._id,
      chatId: chat._id,
      message
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to create job"
    });
  }
};

const getMessage = async (req, res) => {
  try {
    const chatId = req.params.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username") 
      .sort({ createdAt: 1 }); 

    res.json({
      success: true,
      data: messages,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to get message",
    });
  }
};

const getChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      participants: userId,
    })
      .populate("participants", "username")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: chats,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to get chats",
    });
  }
};


const sendMessage = async (req, res) => {
  try {
    const chatId = req.params.id;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const newMessage = await Message.create({
      chat: chatId,
      sender: req.user._id,
      message,
    });

    chat.updatedAt = new Date();
    await chat.save();

    const populatedMessage = await newMessage.populate("sender", "username");

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

const getCompletedJobs = async (req, res) => {
  try {
    const clientId = req.user._id;

    const jobs = await Job.find({
      client: clientId,

    }).populate("freelancer", "username");
    
    const jobsWithPayment = await Promise.all(
      jobs.map(async (job) => {
        const payment = await JobPayment.findOne({ job: job._id });
        return {
          ...job.toObject(),
          payment: payment || { status: "pending" },
        };
      })
    );
    res.status(200).json({
      success: true,
      data: jobsWithPayment
    })
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch completed jobs",
    });
  }
};

const openClassLearner = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user._id;

    const onlineClass = await OnlineClass.findById(id);
    if (!onlineClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    const enrollment = await enrolled.findOne({
      user_id: userId,
      course_id: onlineClass.course_id,
      expires_at: { $gt: new Date() },
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "User not enrolled or enrollment expired" });
    }

    res.json({
      success: true,
      roomId: onlineClass.url,
    });
  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ message: "Failed to open class", error: err.message });
  }
};

const generateOTP = () =>{
  return Math.floor(100000 + Math.random() * 900000).toString();
}
const sendPassChangeOTP = async (req, res) => {
  try{
    const { email } = req.body ;
    if (!email){
      return res.status(400).json({
        message: "Email is required"
      });
    }
    const user = await User.findOne({email});
    if (!user){
      return res.status(404).json({
        message: "User not found"
      });
    }
    const otp = generateOTP(); 
    user.resetOTP = otp ; 
    user.otpExpire = Date.now() + 5 * 60 * 1000; 
    await user.save();
    await transporter.sendMail({
      from: '"Skill Connect Pro" <no-reply@sc.com>',
      to: email,
      subject: "Password Reset OTP ",
      html: `
        <h2>Reset Password</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This will expire in 5 minutes.</p>
      `,
    });
    res.json({
      success: true,
      message: "OTP sent (check Mailtrap inbox)",
    });
  }catch(err){
    console.log(err);
    res.status(500).json({
      success: false,
      message: "OTP failed to send"
    })
  }
}
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (user.resetOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isOTPVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // OPTIONAL: check OTP verified flag (recommended)
    // if (!user.isOTPVerified) {
    //   return res.status(403).json({ message: "OTP not verified" });
    // }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOTP = null;
    user.otpExpire = null;

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, getUserCourse,
   getFreelancers, getFreelancerById,createJob ,getMessage,
    getChats, sendMessage, getCompletedJobs, openClassLearner, sendPassChangeOTP,
  verifyOTP, resetPassword};