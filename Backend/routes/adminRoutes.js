const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
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
  getAllOrders
} = require('../controllers/adminController');

// All routes are protected and admin-only
router.get('/pending-instructors', protect, adminOnly, getPendingInstructors);
router.get('/pending-freelancers', protect, adminOnly, getPendingFreelancers);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/count',protect,adminOnly,countUsers);
router.route('/courses/count').get(countCourses);

router.get('/courses',protect,adminOnly,getAllCourses); 
router.put('/courses/approve/:id',protect,adminOnly,approveCourse); 
router.delete('/courses/reject/:id',protect,adminOnly,rejectCourse);

router.put('/approve-user/:id', protect, adminOnly, approveUser);
router.delete('/reject-user/:id', protect, adminOnly, rejectUser);

router.get('/orders',protect,adminOnly,getAllOrders);

// Notification routes
router.get('/notifications', protect, adminOnly, getNotifications);
router.put('/notifications/:id/read', protect, adminOnly, markNotificationRead);
router.put('/notifications/read-all', protect, adminOnly, markAllNotificationsRead);

module.exports = router;

