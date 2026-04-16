const Job = require('../models/Job');
const Chat = require('../models/Chat');
const Message = require('../models/message');
const Notification = require('../models/notificationModel');
const JobPayment = require('../models/jobPayment')
const User = require('../models/userModel');

const getStats = async (req, res) => {
  try {
    const freelancerId = req.user._id;

    const totalJobs = await Job.countDocuments({
      freelancer: freelancerId,
      requestStatus: "accepted",
    });

    const completedJobs = await Job.countDocuments({
      freelancer: freelancerId,
      status: "completed",
      requestStatus: "accepted",
    });

    const earningsData = await JobPayment.aggregate([
      {
        $match: {
          freelancer: freelancerId,
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const earnings = earningsData[0]?.total || 0;

    const pendingPayments = await JobPayment.aggregate([
      {
        $match: {
          freelancer: freelancerId,
          status: "pending",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const pendingEarnings = pendingPayments[0]?.total || 0;

    res.json({
      success: true,
      totalJobs,
      completedJobs,
      earnings,          
      pendingEarnings,   
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to get stats",
    });
  }
};
const getRecentProjects = async (req, res) => {
  try {
    const freelancerId = req.user._id;

    const projects = await Job.find({
      freelancer: freelancerId,
      requestStatus: "accepted",
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("title description budget status");

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};

const getHireRequests = async (req, res) => {
  try {
    const freelancerId = req.user._id;

    const requests = await Job.find({
      freelancer: freelancerId,
      requestStatus: "pending",
    })
      .populate("client", "username")
      .sort({ createdAt: -1 });

    const formatted = requests.map((job) => ({
      _id: job._id,
      projectTitle: job.title,
      clientName: job.client?.username || "Unknown",
      budget: job.budget,
      message: job.description,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hire requests",
    });
  }
};
const handleHireRequest = async (req, res) => {
  try {
    const { id, action } = req.params;

    const job = await Job.findOne({
      _id: id,
      freelancer: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const io = req.app.get("io");
    let chatId = job.chat;

    if (action === "accept") {
      if (job.requestStatus !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Request already handled",
        });
      }

      job.requestStatus = "accepted";
      job.status = "in-progress";

      if (!chatId) {
        const newChat = await Chat.create({
          participants: [job.client, job.freelancer],
        });
        chatId = newChat._id;
        job.chat = chatId;
      }

      const msg = await Message.create({
        chat: chatId,
        sender: job.freelancer,
        message: "Project accepted. Let's start!",
        type: "text",
      });

      if (io) {
        io.to(chatId.toString()).emit("receive-message", {
          _id: msg._id,
          chat: chatId,
          sender: { _id: job.freelancer, username: req.user.username },
          message: msg.message,
          type: msg.type,
          createdAt: msg.createdAt,
        });
      }
    }

    else if (action === "reject") {
      if (job.requestStatus !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Already handled",
        });
      }

      job.requestStatus = "rejected";
    }

    else if (action === "complete") {
      if (job.status !== "in-progress") {
        return res.status(400).json({
          success: false,
          message: "Only in-progress jobs can be completed",
        });
      }

      job.status = "completed";

      if (chatId) {
        const msg = await Message.create({
          chat: chatId,
          sender: job.freelancer,
          message: "Project completed successfully.",
          type: "text",
        });

        if (io) {
          io.to(chatId.toString()).emit("receive-message", {
            _id: msg._id,
            chat: chatId,
            sender: { _id: job.freelancer, username: req.user.username },
            message: msg.message,
            type: msg.type,
            createdAt: msg.createdAt,
          });
        }
      }
    }

    else {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    const notification = new Notification({
      user: job.client,
      relatedUserId: job.freelancer,
      type: "hire_request",
      title: `Job ${action}`,
      message: `Your job "${job.title}" was ${action}ed by ${req.user.username}`,
    });

    await notification.save();

    if (io) {
      io.to(job.client.toString()).emit("receive-notification", {
        _id: notification._id,
        user: notification.user,
        relatedUserId: notification.relatedUserId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
        isRead: notification.isRead,
      });
    }

    await job.save();

    res.json({
      success: true,
      message: `Job ${action}ed successfully`,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to update request",
    });
  }
};

const getAllJobs = async (req, res) => {
  try{
    const jobs = await Job.find({freelancer: req.user.id})
      .populate("client", "username")
      .sort({createdAt: -1});
    res.status(200).json({
      success: true,
      data: jobs 
    });
  }catch(error){
    console.log(error); 
    res.status(500).json({
      success: false,
      message: "Failed to get all jobs"
    });
  } 
}

const getPaidJobsInfo = async (req, res) => {
  try {

    const jobs = await Job.find({
      freelancer: req.user.id,
      status: "completed",
    }).populate("client", "username");

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
      data: jobsWithPayment,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      username,
      email,
      bio,
      skills,
      location,
      experienceLevel,
      hourlyRate,
      profileImage,
      password
    } = req.body;

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = skills;
    if (location !== undefined) user.location = location;
    if (profileImage !== undefined) user.profileImage = profileImage;

    if (user.role === "freelancer") {
      if (experienceLevel) user.experienceLevel = experienceLevel;
      if (hourlyRate !== undefined) user.hourlyRate = hourlyRate;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters"
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        location: updatedUser.location,
        experienceLevel: updatedUser.experienceLevel,
        hourlyRate: updatedUser.hourlyRate,
        profileImage: updatedUser.profileImage,
        isApproved: updatedUser.isApproved
      }
    });

  } catch (error) {
    console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
  }
};
module.exports = {
  getStats,
  getRecentProjects,
  getHireRequests,
  handleHireRequest,
  getAllJobs,
  getPaidJobsInfo,
  updateUserProfile
};