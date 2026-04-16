const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { addToCart,getCartItems } = require('../controllers/cartController');
router.get('/',protect, getCartItems );
router.post('/', protect, addToCart);

module.exports = router;