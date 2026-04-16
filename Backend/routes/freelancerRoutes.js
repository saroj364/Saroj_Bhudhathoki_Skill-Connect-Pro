const express = require('express');
const router = express.Router();

const {
  getStats,
  getRecentProjects,
  getHireRequests,
  handleHireRequest,
  getAllJobs,
  getPaidJobsInfo,
  updateUserProfile,
} = require('../controllers/freelancerController');

const { protect, freelancerOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, getStats);
router.get('/recent-projects', protect, getRecentProjects);
router.get('/hire-requests', protect, getHireRequests);
router.get('/alljobs',protect,freelancerOnly,getAllJobs);

router.put('/profile',protect,freelancerOnly,updateUserProfile);
router.get('/client/completed-jobs',protect,freelancerOnly,getPaidJobsInfo);
router.put('/hire-requests/:id/:action', protect, freelancerOnly,handleHireRequest);

module.exports = router;