const express = require('express');
const { registerUser, loginUser, getUserProfile, getUserCourse, getFreelancers, getFreelancerById, createJob, getMessage, getChats, sendMessage, getCompletedJobs, openClassLearner} = require('../controllers/userController');
const { protect,clientOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Register a new user
router.post('/', registerUser);

// Login user
router.post('/login', loginUser);

// Get user profile (protected route)
router.get('/profile', protect, getUserProfile);
router.get('/courses',protect,getUserCourse);

router.get('/freelancer', getFreelancers);

router.post('/freelancer/create',protect,clientOnly,createJob);

router.get('/chat',protect,getChats);
router.get('/client/job-track',protect,clientOnly,getCompletedJobs);

router.get('/freelancer/:id',getFreelancerById);
router.get('/chat/:id',protect,getMessage);

router.post('/chat/:id',protect,sendMessage);
router.get('/online-class/learner/:id',protect,openClassLearner);

module.exports = router;