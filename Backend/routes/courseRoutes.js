const express = require('express'); 
const { Courses, getCourseById, getFeaturedCourses, getModules, joinOnlineClass, getAllOClass, getJoinedUsers } =  require('../controllers/courseController'); 
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/featured',getFeaturedCourses);
router.get('/online-class', protect, getAllOClass); 
router.get('/:id/users',protect,getJoinedUsers);

router.get('/module/:id',getModules);
router.post('/join/:id',protect,joinOnlineClass);
router.route('/:id').get(getCourseById); 
router.route('/').get(Courses); 

module.exports = router;  