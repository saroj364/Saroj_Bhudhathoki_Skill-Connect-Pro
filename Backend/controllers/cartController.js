const Cart = require('../models/cartModel');
const Course = require('../models/courseModel');
const getCartItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await Cart.find({ user_id: userId }).select("course_id price").sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: cartItems
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const addToCart = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (!course.isPublished) {
      return res.status(400).json({ message: 'Course not available' });
    }
    if (course.instructor_id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot buy your own course' });
    }
    const alreadyInCart = await Cart.findOne({
      user_id: req.user._id,
      course_id: courseId
    });
    if (alreadyInCart) {
      return res.status(400).json({ message: 'Course already in cart' });
    }
    const cartItem = await Cart.create({
      user_id: req.user._id,
      course_id: courseId,
      price: course.price
    });
    res.status(201).json({
      message: 'Course added to cart',
      cartItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addToCart,
  getCartItems
};