const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  initiateEsewaPayment,
  esewaSuccess,
  esewaFailure,
  initiateJobPayment,
  jobPaymentSuccess,
  jobPaymentFailure
} = require('../controllers/paymentController');

router.post('/esewa', protect, initiateEsewaPayment);
router.get('/esewa-success', esewaSuccess);
router.get('/esewa-failure', esewaFailure);

router.post('/job/esewa', protect, initiateJobPayment);
router.get('/job-success', jobPaymentSuccess);
router.get('/job-failure', jobPaymentFailure);

module.exports = router;