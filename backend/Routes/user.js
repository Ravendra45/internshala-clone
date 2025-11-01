// backend/routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/login-history', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ msg: 'userId required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'no user' });

    res.json(user.loginHistory || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
