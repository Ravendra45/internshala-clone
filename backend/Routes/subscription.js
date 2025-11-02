const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const Razorpay = require('razorpay');
const User = require('../models/User');
const plans = require('../config/plans');
const { sendEmail } = require('../utils/email');

const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });




let razorpayClient = null;
try {
  const Razorpay = require('razorpay');
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } else {
    console.warn('Razorpay keys not set; payment endpoints will be disabled.');
  }
} catch (err) {
  console.warn('Failed to initialize Razorpay client:', err.message);
  razorpayClient = null;
}








function isWithinPaymentWindow() {
  const h = moment().tz('Asia/Kolkata').hour();
  // allow only between 10:00 and 11:00 (10 <= hour < 11)
  return (h >= 10 && h < 11);
}

router.post('/create-order', async (req,res) => {
  if (!isWithinPaymentWindow()) return res.status(403).json({ msg: 'Payments allowed only 10–11 AM IST' });

  const { userId, plan } = req.body;
  if (!plans[plan]) return res.status(400).json({ msg: 'invalid plan' });
  const amount = plans[plan].price * 100; // in paise
  const order = await razorpay.orders.create({ amount, currency: 'INR', receipt: `rcpt_${Date.now()}`});
  res.json({ order });
});

// verify payment & activate subscription
router.post('/verify', async (req,res) => {
  // req.body: { userId, plan, razorpay_payment_id, razorpay_order_id, razorpay_signature }
  const { userId, plan, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const crypto = require('crypto');
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
  if (expected !== razorpay_signature) return res.status(400).json({ msg: 'invalid signature' });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ msg: 'user not found' });

  user.subscription = {
    plan,
    startedAt: new Date(),
    expiresAt: plan === 'gold' ? null : moment().add(30, 'days').toDate()
  };
  await user.save();

  // send invoice email
  await sendEmail({
    to: user.email,
    subject: 'Subscription activated',
    text: `Your ${plan} plan is active. Order: ${razorpay_order_id}, payment: ${razorpay_payment_id}`
  });

  res.json({ msg: 'subscription activated' });
});




module.exports = router;
