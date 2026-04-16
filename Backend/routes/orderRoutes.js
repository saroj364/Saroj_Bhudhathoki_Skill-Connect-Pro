const express = require('express'); 
const router = express.Router();

const { protect } = require('../middleware/authMiddleware'); 
const { getOrder } = require('../controllers/OrderController'); 

router.get('/my-orders',protect,getOrder); 

module.exports = router; 