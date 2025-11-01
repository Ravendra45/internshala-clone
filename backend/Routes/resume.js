const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateOTP } = require('../utils/generate');
const { sendEmail } = require('../utils/email');
const Razorpay = require('razorpay');
const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
const moment = require('moment-timezone');

router.post('/request-otp', async (req,res) => {
  const { userId } = req.body;
  const u = await User.findById(userId);
  if(!u) return res.status(404).json({ msg: 'no user' });
  // only for premium (we treat bronze/silver/gold as paid; adjust if specification requires different)
  if (!u.subscription || (u.subscription.plan === 'free')) return res.status(403).json({ msg: 'Resume is premium feature. Subscribe.' });
  const code = generateOTP(6);
  u.otp = { code, expiresAt: new Date(Date.now()+10*60*1000), purpose: 'resume_pay' };
  await u.save();
  await sendEmail({ to: u.email, subject: 'Your OTP for resume payment', text: `OTP: ${code}` });
  res.json({ msg: 'OTP sent' });
});

router.post('/verify-otp', async (req,res) => {
  const { userId, code } = req.body;
  const u = await User.findById(userId);
  if(!u || !u.otp) return res.status(400).json({ msg: 'Invalid' });
  if (u.otp.purpose !== 'resume_pay') return res.status(400).json({ msg: 'Purpose mismatch' });
  if (u.otp.expiresAt < new Date()) return res.status(400).json({ msg: 'OTP expired' });
  if (u.otp.code !== code) return res.status(400).json({ msg: 'Wrong OTP' });
  // clear OTP
  u.otp = null;
  await u.save();
  // create razorpay order for ₹50
  const order = await razorpay.orders.create({ amount: 50*100, currency: 'INR', receipt: `resume_${Date.now()}` });
  res.json({ order });
});

router.post('/complete', async (req,res) => {
  // req.body: userId, order verify data, resumeData
  const { userId, resumeData, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  // verify signature
  const crypto = require('crypto');
  const sign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
  if (sign !== razorpay_signature) return res.status(400).json({ msg: 'invalid signature' });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ msg: 'user not found' });
  // create resume record
  user.resumes.push({ title: resumeData.name, data: resumeData, fileUrl: '' }); // we can generate PDF later
  await user.save();
  // send email confirmation
  await sendEmail({ to: user.email, subject: 'Resume generated', text: 'Your resume has been generated and attached to profile.' });
  res.json({ msg: 'resume saved' });
});

module.exports = router;
