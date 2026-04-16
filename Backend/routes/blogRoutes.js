const express = require('express');
const { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all blogs and create a new blog
router.route('/')
  .get(getBlogs)
  .post(protect, createBlog);

// Get, update and delete blog by ID
router.route('/:id')
  .get(getBlogById)
  .put(protect, updateBlog)
  .delete(protect, deleteBlog);

module.exports = router;