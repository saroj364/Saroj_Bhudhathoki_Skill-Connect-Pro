const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notiController');
const {protect}= require('../middleware/authMiddleware');

router.get('/', protect ,getNotifications);
router.patch('/mark-read/:id', protect, markAsRead);

module.exports = router;