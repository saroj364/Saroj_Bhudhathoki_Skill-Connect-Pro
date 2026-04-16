const Blog = require('../models/blogModel');
const User = require('../models/userModel');

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
  try {
    const { title, content, category, tags, image } = req.body;

    // Create new blog with author set to current user
    const blog = await Blog.create({
      title,
      content,
      category,
      tags,
      image,
      author: req.user._id
    });

    if (blog) {
      res.status(201).json(blog);
    } else {
      res.status(400).json({ message: 'Invalid blog data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate('author', 'name email');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get blog by ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email');
    
    if (blog) {
      res.json(blog);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res) => {
  try {
    const { title, content, category, tags, image, isPublished } = req.body;
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if user is the author of the blog
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this blog' });
    }
    
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    blog.tags = tags || blog.tags;
    blog.image = image || blog.image;
    blog.isPublished = isPublished !== undefined ? isPublished : blog.isPublished;
    
    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if user is the author of the blog
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this blog' });
    }
    
    await Blog.deleteOne({ _id: req.params.id });
    res.json({ message: 'Blog removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog };