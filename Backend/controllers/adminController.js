const User = require('../models/userModel');
const Course = require('../models/courseModel'); 
const Notification = require('../models/notificationModel');
const Order = require('../models/Order');
const Job = require('../models/Job')
const Modules = require('../models/modules');
// @desc    Get all pending instructors
// @route   GET /api/admin/pending-instructors
// @access  Private/Admin
const getPendingInstructors = async (req, res) => {
  try {
    const pendingInstructors = await User.find({
      role: 'instructor',
      isApproved: false
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingInstructors.length,
      data: pendingInstructors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
// @desc    Get all pending freelancers
// @route   GET /api/admin/pending-freelancers
// @access  Private/Admin
const getPendingFreelancers = async (req, res) => {
  try {
    const pendingFreelancers = await User.find({
      role: 'freelancer',
      isApproved: false
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingFreelancers.length,
      data: pendingFreelancers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve instructor/freelancer
// @route   PUT /api/admin/approve-user/:id
// @access  Private/Admin
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'instructor' && user.role !== 'freelancer') {
      return res.status(400).json({ message: 'Only instructors and freelancers need approval' });
    }

    if (user.isApproved) {
      return res.status(400).json({ message: 'User is already approved' });
    }

    user.isApproved = true;
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;
    await user.save();

    await Notification.updateMany(
      {
        user: req.user._id,
        relatedUserId: user._id,
        type: user.role === 'instructor' ? 'INSTRUCTOR_REGISTRATION' : 'FREELANCER_REGISTRATION'
      },
      { isRead: true }
    );

    res.json({
      success: true,
      message: `${user.role} approved successfully`,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        approvedAt: user.approvedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Decline/Reject instructor/freelancer
// @route   DELETE /api/admin/reject-user/:id
// @access  Private/Admin
const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'instructor' && user.role !== 'freelancer') {
      return res.status(400).json({ message: 'Only instructors and freelancers can be rejected' });
    }

    // Delete the user (or you can mark as rejected instead)
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `${user.role} rejected and removed successfully`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('relatedUserId', 'username email role')
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });
    
    res.json({
      success: true,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private/Admin
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/admin/notifications/read-all
// @access  Private/Admin
const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const countUsers = async (req, res) => {
  try{
    const count = await User.countDocuments({});
    res.status(200).json({
      success:true,
      data : count
    });
  }catch(error){
    res.status(500).json({
      success:false,
      message: error.message
    });
  }
};

const countCourses = async (req, res) => {
  try{
    const courses = await Course.countDocuments({}); 
    res.status(200).json({
      success:true,
      data: courses
    });
  }catch(error){
    res.status(500).json({
      success:false,
      message: error.message
    });
  }
}

const getAllCourses = async (req,res) => {
  try{
    const courses = await Course.find({}).populate('instructor_id','username email').sort({createdAt: -1});
    res.status(200).json({
      success:true,
      data:courses
    });
  }catch(error){
    res.status(500).json({
      success:false,
      message: 'Failed to fetch courses'
    });
  }
};
const approveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.isPublished = true; 
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course approved successfully'
    });

  } catch (error) {
    console.error('Error approving course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve course'
    });
  }
};

const rejectCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.status = 'rejected';
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course rejected successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject course'
    });
  }
};



const getAllOrders = async ( req, res) =>{
  try{
    const orders = await Order.find({}).sort({createdAt: -1});
    res.status(200).json({
      success: true,
      message: orders
    });
  }catch(error){
    console.error(error); 
    res.status(500).json({
      success:false,
      message: 'Failed to get all orders'
    });
  }
};

const countGigs = async( req, res) =>{
  try{
   const result = await Job.aggregate([
      {
        $match: {
          $or: [
            { requestStatus: "accepted" },
            { status: { $in: ["completed", "in-progress"] } }
          ]
        }
      },
      {
        $count: "totalGigs"
      }
    ]);
    const gigs = result.length > 0 ? result[0].totalGigs : 0;

    res.status(200).json({
      success: true,
      data: gigs
    });
  }catch(error){
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to count gigs"
    });
  }
}

const getAllModules = async(req, res) =>{
  try{
    const module = await Modules.find({course_id: req.params.id}); 
    res.status(200).json({
      success: true,
      data: module
    });
  }catch(error){
    res.status(500).json({
      success: false,
      message: "Failed to fetch all modules"
    });
  }
}
module.exports = {
  getPendingInstructors,
  getPendingFreelancers,
  approveUser,
  rejectUser,
  getAllUsers,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  countUsers,
  countCourses,
  getAllCourses,
  approveCourse,
  rejectCourse,
  getAllOrders,
  countGigs,
  getAllModules
};

