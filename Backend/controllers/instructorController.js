const Course = require('../models/courseModel'); 
const Order = require('../models/Order');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Module = require('../models/modules');
const Enrollment = require('../models/Enrollment'); 
const OnlineClass = require('../models/onlineClassModel');
// const { v4: uuidv4 } = require('uuid');
const ModuleProgress = require('../models/progress');

const mongoose = require("mongoose");

const getUploadedCourse = async (req, res) => {
    try{
        const instructorId = req.user.id ; 
        const courses = await Course.find({instructor_id: instructorId}).sort({createdAt: -1}); 
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        }); 
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        }); 
    }
}; 
const uploadCourse = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { title, description, price, duration, category, level, modules } = req.body;

    const thumbnail = req.file ? `/uploads/courses/${req.file.filename}` : "";

    if (!title || !description || !price || !duration || !category) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide all required fields" 
      });
    }

    let parsedModules = [];
    if (modules) {
      try {
        parsedModules = typeof modules === "string" ? JSON.parse(modules) : modules;
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid modules format" });
      }
      if (!Array.isArray(parsedModules)) {
        return res.status(400).json({ success: false, message: "Modules must be an array" });
      }
      if (parsedModules.length > 12) {
        return res.status(400).json({ success: false, message: "Maximum 12 modules allowed" });
      }
    }
    const course = new Course({
      instructor_id: instructorId,
      title,
      description,
      price,
      duration,
      category,
      level: level || 'beginner',
      thumbnail,
      isPublished: false,
      isRequested: false
    });

    await course.save();

    if (parsedModules.length > 0) {
      const modulesToInsert = parsedModules.map(mod => ({
        course_id: course._id,
        title: mod.title,
        progressPoint: mod.progressPoint || 0
      }));
      await Module.insertMany(modulesToInsert);
    }

    return res.status(200).json({
      success: true,
      message: "Course uploaded successfully with modules",
      data: course
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to upload course" 
    });
  }
};


const reqPublish = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByIdAndUpdate(
      courseId,
      { isRequested: true },
      { new: true }
    ).populate("instructor_id", "username");

    const io = req.app.get("io");
    const admins = await User.find({ role: "admin" });

    await Promise.all(
      admins.map(async (admin) => {
        const notification = new Notification({
          user: admin._id, 
          relatedUserId: course.instructor_id._id, 
          type: "course_publish_request",
          title: "Course Publish Request",
          message: `${course.instructor_id.username} requested to publish "${course.title}"`,
        });

        await notification.save();
        if (io) {
          io.to(admin._id.toString()).emit("receive-notification", {
            _id: notification._id,
            user: admin._id,
            relatedUserId: course.instructor_id._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            createdAt: notification.createdAt,
            isRead: notification.isRead,
          });
        }

      })
    );

    res.json({
      success: true,
      message: "Publish request sent",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to request publish",
    });
  }
};

const myCourse = async(req,res) => {
    try{
        const courses = await Course.countDocuments({instructor_id: req.user.id}).sort({createAdt: -1});
        res.status(200).json({
            success:true,
            data: courses
        }) ;

    }catch(error){
        console.log(error); 
        res.status(500).json({
            success: false,
            message: "Error"
        });
    }
}
const recentAddedCourse = async(req,res) => {
  try{
    const instructorId = req.user.id ; 
    const courses = await Course.find({instructor_id: instructorId}).sort({createdAt: -1}).limit(3); 
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    }); 
  }catch(error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to get courses"
    }); 
  }
};

const earnings = async (req, res) => {
  try {
    const total = await User.find({_id: req.user.id}).select("-_id earnings");
    res.status(200).json({
      success: true,
      data: total
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to get earnings"
    });
  }
};

const editCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const instructorId = req.user._id;

    const { title, description, price, category, level, duration } = req.body;

    const updateData = {
      title,
      description,
      price,
      category,
      level,
      duration,
      isRequested: false,
      isPublished: false,
    };

    if (req.file) {
      updateData.thumbnail = `/uploads/${req.file.filename}`;
    }

    const course = await Course.findOneAndUpdate(
      { _id: courseId, instructor_id: instructorId },
      updateData,
      { new: true }
    ).populate("instructor_id", "username");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const io = req.app.get("io");
    const admins = await User.find({ role: "admin" });
    await Promise.all(
      admins.map(async (admin) => {
        const notification = new Notification({
          user: admin._id,
          relatedUserId: course.instructor_id._id,
          type: "course_edit_request",
          title: "Course Edit Request",
          message: `${course.instructor_id.username} edited course "${course.title}" and requested approval`,
        });
        await notification.save();
        if (io) {
          io.to(admin._id.toString()).emit("receive-notification", notification);
        }
      })
    );

    res.json({ success: true, message: "Course updated successfully", data: course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update course" });
  }
};

const editModules = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { modules } = req.body;

    if (!modules) return res.status(400).json({ success: false, message: "Modules required" });

    const parsedModules = Array.isArray(modules) ? modules : JSON.parse(modules);

    const existingModules = await Module.find({ course_id: courseId });
    const existingIds = existingModules.map((m) => m._id.toString());

    const incomingIds = parsedModules.filter(m => m._id && m._id !== "").map(m => m._id.toString());

    const modulesToDelete = existingIds.filter(id => !incomingIds.includes(id));
    if (modulesToDelete.length > 0) {
      await Module.deleteMany({ _id: { $in: modulesToDelete } });
    }

    for (const mod of parsedModules) {
      if (!mod.title || mod.title.trim() === "") continue;

      if (mod._id && mod._id !== "") {
        await Module.findByIdAndUpdate(mod._id, {
          title: mod.title,
          progressPoint: mod.progressPoint || 0,
        });
      } else {
        await Module.create({
          course_id: courseId,
          title: mod.title,
          progressPoint: mod.progressPoint || 0,
        });
      }
    }

    res.json({ success: true, message: "Modules updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update modules" });
  }
};

const getModules = async (req, res) => {
  try{
    const modules = await Module.find({course_id: req.params.id});
    res.status(200).json({
      success: true,
      data: modules
    });
  }catch(error){
    console.log(error); 
    res.status(500).json({
      success: false,
      message: "Failed to get Moudules"
    });
  }
};



const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id; 

    const course = await Course.findOne({ _id: courseId, instructor_id: userId });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or you're not authorized" });
    }

    await Module.deleteMany({ course_id: courseId });

    await Course.deleteOne({ _id: courseId });

    res.status(200).json({ 
      success: true, 
      message: "Course deleted successfully" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete course" 
    });
  }
};


const createOnlineClass = async (req, res) => {
  try {
    const { course_id, module_id, start_time } = req.body;

    const roomId = uuidv4();

    const onlineClass = await OnlineClass.create({
      course_id,
      module_id,
      instructor_id: req.user._id,
      start_time,
      status: "scheduled",
      url: roomId 
    });


    res.status(201).json({
      success: true,
      message: "Online class created",
      data: onlineClass
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create class" });
  }
};
const completeOnlineClass = async (req, res) => {
  try {
    const roomId = req.params.id; 

    const onlineClass = await OnlineClass.findOne({ url: roomId });
    if (!onlineClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (onlineClass.status === 'completed') {
      return res.status(400).json({ message: 'Class already completed' });
    }

    await OnlineClass.updateOne(
      { url: roomId },
      { status: 'completed', end_time: new Date() }
    );

    const module = await Module.findById(onlineClass.module_id);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    const modulePoints = module.progressPoint || 0;

    const users = Array.isArray(onlineClass.users_joined) ? onlineClass.users_joined : [];
    for (const user of users) {
      const userId = user.user_id || user; 
      await ModuleProgress.findOneAndUpdate(
        { user_id: userId, module_id: onlineClass.module_id },
        { $inc: { progressPoint: modulePoints } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.status(200).json({ 
      success: true,
      message: 'Class completed and progress updated',
      onlineClass
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const getJoinedUsers = async (req, res) => {
  try {
    const onlineClass_id = req.params.id;
    const onlineClass = await OnlineClass.findById(onlineClass_id)
      .populate('users_joined.user_id', 'username email');
    if (!onlineClass) return res.status(404).json({ message: 'Class not found' });

    res.status(200).json({ 
      success: true,
      users: onlineClass.users_joined 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};
const openClassInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const onlineClass = await OnlineClass.findById(id);
    if (!onlineClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (onlineClass.instructor_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      roomId: onlineClass.url,
    });
  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({
      message: "Failed to open class",
      error: err.message,
    });
  }
};

module.exports = { getUploadedCourse, uploadCourse ,reqPublish,
   myCourse, recentAddedCourse, earnings, 
   editCourse, getModules,editModules, deleteCourse,
   completeOnlineClass, getJoinedUsers, createOnlineClass, openClassInstructor
  };