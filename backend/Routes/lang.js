const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateOTP } = require('../utils/generate');
const { sendEmail } = require('../utils/email');

router.post('/request-fr-otp', async (req,res) => {
  const { userId } = req.body;
  const u = await User.findById(userId);
  if(!u) return res.status(404).json({ msg: 'no user' });
  const code = generateOTP(6);
  u.otp = { code, expiresAt: new Date(Date.now()+10*60*1000), purpose: 'lang_fr' };
  await u.save();
  await sendEmail({ to: u.email, subject: 'OTP for switching to French', text: `OTP: ${code}` });
  res.json({ ok: true });
});

router.post('/verify-fr-otp', async (req,res) => {
  const { userId, code } = req.body;
  const u = await User.findById(userId);
  if(!u || !u.otp) return res.status(400).json({ ok:false, msg: 'invalid' });
  if (u.otp.purpose !== 'lang_fr') return res.status(400).json({ ok:false, msg: 'purpose mismatch' });
  if (u.otp.expiresAt < new Date()) return res.status(400).json({ ok:false, msg: 'expired' });
  if (u.otp.code !== code) return res.status(400).json({ ok:false, msg: 'wrong' });
  u.otp = null;
  await u.save();
  res.json({ ok: true });
});

module.exports = router;
