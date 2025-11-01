// backend/Routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generatePassword, generateOTP } = require('../utils/generate');
const { sendEmail } = require('../utils/email'); // <= single declaration
const moment = require('moment-timezone');

/**
 * FORGOT PASSWORD (email or phone) — one request per 24 hours
 */
router.post('/forgot', async (req, res) => {
  try {
    const { email, phone } = req.body;
    const user = email ? await User.findOne({ email }) : await User.findOne({ phone });
    if (!user) return res.status(404).json({ msg: 'user not found' });

    const now = new Date();
    if (user.lastForgotRequest && (now - user.lastForgotRequest) < 24 * 60 * 60 * 1000) {
      return res.status(429).json({ msg: 'You can request password reset only once every 24 hours' });
    }

    const newPass = generatePassword(10);
    user.password = newPass; // IMPORTANT: hash in production
    user.lastForgotRequest = now;
    await user.save();

    if (user.email) {
      await sendEmail({ to: user.email, subject: 'Your new password', text: `Your new password: ${newPass}` });
    }

    res.json({ msg: 'Password reset. Check email (or SMS).' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * LOGIN with device rules (Chrome -> OTP; Mobile -> restricted time)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'user not found' });

    // Basic password check — replace with bcrypt in production
    if (user.password !== password) return res.status(401).json({ msg: 'wrong credentials' });

    const ua = req.useragent || {};
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Chrome requires OTP
    if (ua.isChrome) {
      const code = generateOTP(6);
      user.otp = { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000), purpose: 'login_chrome' };
      await user.save();
      await sendEmail({ to: user.email, subject: 'Login OTP', text: `OTP: ${code}` });
      return res.json({ msg: 'otp_sent', needOtp: true });
    }

    // Mobile restricted to 10-13 IST
    if (ua.isMobile) {
      const h = moment().tz('Asia/Kolkata').hour();
      if (!(h >= 10 && h < 13)) {
        return res.status(403).json({ msg: 'Mobile access allowed only 10 AM to 1 PM IST' });
      }
    }

    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push({ ip, userAgent: ua, time: new Date() });
    await user.save();

    // respond with user (or token) — replace by your auth token logic
    res.json({ msg: 'ok', user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * verify login OTP (for Chrome)
 */
router.post('/verify-login-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.otp || user.otp.purpose !== 'login_chrome') return res.status(400).json({ msg: 'invalid' });
    if (user.otp.expiresAt < new Date()) return res.status(400).json({ msg: 'expired' });
    if (user.otp.code !== code) return res.status(400).json({ msg: 'wrong' });

    user.otp = null;
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push({ ip: req.ip, userAgent: req.useragent, time: new Date() });
    await user.save();

    res.json({ msg: 'ok', user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
