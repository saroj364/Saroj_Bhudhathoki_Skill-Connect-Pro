const Course = require('../models/courseModel'); 
const Comment = require('../models/cmtModel');
const Module = require('../models/modules');
const Enrollment = require('../models/Enrollment');
const OnlineClass = require('../models/onlineClassModel');

const getFeaturedCourses = async ( req, res) => {
    try{
        const courses = await Course.find({isPublished: true}).sort({createdAt: -1}).populate('instructor_id','username email').limit(4);
        return res.status(200).json({
            success: true,
            count: courses.length,
            data:courses
        });
    }catch(error){
        return res.status(500).json({
            success:true,
            count: courses.length,
            data: courses
        });
    }
}

const Courses = async (req, res) => {
  try {
    const courses = await Course.find({isPublished: true})
      .populate('instructor_id', 'username email');

    res.status(200).json({
      success: true,
      data: courses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
};

const getCourseById = async (req,res)=>{
    try{
        const course = await Course.findById(req.params.id).populate('instructor_id','username email'); 
        if(course){
            res.status(200).json({
                success: true ,
                data: course
            });
        }else{
            res.status(404).json({
                success: false,
                message: 'Course not found'});
        }
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
};

const getComments = async (req, res) => {
    try{
        const comments = await Comment.find({}); 
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getModules = async (req, res) => {
  try {

    const modules = await Module.find({
      course_id: req.params.id
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: modules
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get modules"
    });

  }
};

const getAllOClass = async (req, res) => {
  try{
    const classes = await OnlineClass.find()
      .populate("course_id","title")
      .populate("module_id","title")
      .populate("instructor_id","usernamex`")
      .populate("users_joined.user_id","username") ;
    
      res.status(200).json({
        success: true,
        data: classes
      });
  }catch(error){
    console.log(error); 
    res.status(500).json({
      success: false,
      message: "Failed to fetch classes"
    });
  }
}
const getJoinedUsers = async (req, res) => {
  try {
    const onlineClass = await OnlineClass.findById(req.params.id)
      .populate('users_joined.user_id', 'username email');

    if (!onlineClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json({
      success: true ,
      data: onlineClass.users_joined
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
};

const joinOnlineClass = async (req, res) => {
  try {
    const user_id = req.user._id;
    const onlineClass_id = req.params.id;

    const onlineClass = await OnlineClass.findById(onlineClass_id);
    if (!onlineClass) return res.status(404).json({ message: 'Online class not found' });

    if (!onlineClass.users_joined.some(u => u.user_id.equals(user_id))) {
      if (onlineClass.instructor_id.toString() !== user_id.toString()) {
        const enrolled = await Enrollment.findOne({
          user_id,
          course_id: onlineClass.course_id,
          expires_at: { $gt: new Date() }
        });
        if (!enrolled) return res.status(403).json({ message: 'User not enrolled or enrollment expired' });
      }

      onlineClass.users_joined.push({ user_id });
      await onlineClass.save();
    }

    res.json({ success: true, message: 'Joined class', data: onlineClass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to join class' });
  }
};

module.exports = { Courses, getCourseById, getFeaturedCourses, getModules, joinOnlineClass, getAllOClass, getJoinedUsers};