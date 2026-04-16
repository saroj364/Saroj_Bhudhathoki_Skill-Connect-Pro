const crypto = require('crypto');
const Order = require('../models/Order');
const Course = require('../models/courseModel');
const Enrollment = require('../models/Enrollment');
const Cart = require('../models/cartModel');
const Job = require('../models/Job');
const User = require('../models/userModel');
const JobPayment = require('../models/jobPayment');

const generateEsewaSignature = (totalAmount, transactionUuid, productCode) => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const secretKey = "8gBm/:&EnhH.1/q"; 
  return crypto.createHmac('sha256', secretKey).update(message).digest('base64');
};

const initiateEsewaPayment = async (req, res) => {
  try {
    const { courseIds, duration, totalAmount } = req.body;
    if (!courseIds?.length) return res.status(400).json({ message: "No courses selected" });

    const courses = await Course.find({ _id: { $in: courseIds } });
    if (!courses.length) return res.status(404).json({ message: "Courses not found" });

    const transaction_uuid = Date.now().toString();
    const product_code = "EPAYTEST";

    await Promise.all(courses.map(course => Order.create({
      user_id: req.user._id,
      course_id: course._id,
      duration,
      total_amount: course.price * duration,
      transaction_uuid,
      status: "pending",
    })));

    const signature = generateEsewaSignature(totalAmount, transaction_uuid, product_code);

    const payload = {
      amount: totalAmount,
      tax_amount: 0,
      total_amount: totalAmount,
      transaction_uuid,
      product_code,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: "http://localhost:5001/api/payment/esewa-success",
      failure_url: "http://localhost:5001/api/payment/esewa-failure",
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    };

    res.json({ payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};

const esewaSuccess = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) return res.status(400).json({ message: "No payment data received" });

    const decoded = Buffer.from(data, "base64").toString("utf-8");
    const paymentData = JSON.parse(decoded);

    const { transaction_uuid, status, total_amount } = paymentData;

    if (!["COMPLETE", "completed", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const orders = await Order.find({ transaction_uuid });
    if (!orders.length) return res.status(404).json({ message: "Order not found" });

    for (const order of orders) {
      order.status = "paid";
      await order.save();

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + order.duration);

      await Enrollment.create({
        user_id: order.user_id,
        course_id: order.course_id,
        duration: order.duration,
        expires_at: expiresAt,
        progress: 0,
        status: 0
      });

      await Notification.create({
        user: order.user_id,
        type: "Payment",
        title: "Payment successful",
        message: "Your payment has been successful",
      });

      const course = await Course.findById(order.course_id);

      if (course) {
        await Course.findByIdAndUpdate(order.course_id, {
          $inc: { enrolledStudents: 1 },
        });

        if (course.instructor_id) {
          await User.findByIdAndUpdate(course.instructor_id, {
            $inc: { earnings: parseFloat(total_amount) },
          });

          await Notification.create({
            user: course.instructor_id,
            type: "Payment",
            title: "Course Payment",
            message: "Your course has been bought",
            relatedUserId: order.user_id,
          });
        }
      }
      await Cart.deleteOne({ course_id: order.course_id, user_id: order.user_id });
    }

    res.redirect("http://localhost:5173/payment-success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
const esewaFailure = async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.redirect("http://localhost:5173/payment-failed");
    }

    const decoded = Buffer.from(data, "base64").toString("utf-8");
    const paymentData = JSON.parse(decoded);

    const { transaction_uuid } = paymentData;

    if (transaction_uuid) {
      const order = await Order.findOne({ transaction_uuid });

      if (order) {
        await Enrollment.deleteOne({
          user_id: order.user_id,
          course_id: order.course_id,
        });

        await Order.deleteOne({ transaction_uuid });
      }
    }

    return res.redirect("http://localhost:5173/payment-failed");

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment failure handling failed" });
  }
};
const initiateJobPayment = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: "Job ID is required" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const transaction_uuid = Date.now().toString();
    const product_code = "EPAYTEST";

    await JobPayment.create({
      job: job._id,
      client: req.user._id,
      freelancer: job.freelancer,
      amount: job.budget,
      transaction_uuid,
      status: "pending",
    });

    const signature = generateEsewaSignature(job.budget, transaction_uuid, product_code);

    const payload = {
      amount: job.budget,
      tax_amount: 0,
      total_amount: job.budget,
      transaction_uuid,
      product_code,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: "http://localhost:5001/api/payment/job-success",
      failure_url: "http://localhost:5001/api/payment/job-failure",
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    };

    res.json({ payload });

  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({ message: "Job payment initiation failed" });
  }
};

const jobPaymentSuccess = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) return res.status(400).json({ message: "No payment data received" });

    const decoded = Buffer.from(data, "base64").toString("utf-8");
    const paymentData = JSON.parse(decoded);
    const { transaction_uuid, status, total_amount } = paymentData;

    if (!["COMPLETE", "completed", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const payment = await JobPayment.findOne({ transaction_uuid });
    if (!payment) return res.status(404).json({ message: "Payment record not found" });

    payment.status = "paid";
    await payment.save();

    if (payment.freelancer) {
      await User.findByIdAndUpdate(payment.freelancer, {
        $inc: { earnings: parseFloat(total_amount) },
      });
      // TODO: Send notification to freelancer
    }

    res.redirect("http://localhost:5173/job-payment-success");

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Job payment verification failed" });
  }
};
const jobPaymentFailure = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) return res.redirect("http://localhost:5173/job-payment-failed");

    const decoded = Buffer.from(data, "base64").toString("utf-8");
    const paymentData = JSON.parse(decoded);
    const { transaction_uuid } = paymentData;

    if (transaction_uuid) {
      await JobPayment.findOneAndUpdate({ transaction_uuid }, { status: "failed" });
    }

    res.redirect("http://localhost:5173/job-payment-failed");

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Job payment failure handling failed" });
  }
};



module.exports = {
  initiateEsewaPayment,
  esewaSuccess,
  esewaFailure,
  initiateJobPayment,
  jobPaymentSuccess,
  jobPaymentFailure
};