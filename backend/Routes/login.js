
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req,res)=>{
  const {email} = req.body;
  const ua = req.useragent;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const user = await User.findOne({email});
  if(!user) return res.status(400).json({msg:'User not found'});
  user.loginHistory = user.loginHistory || [];
  user.loginHistory.push({at:new Date(), ip, ua});
  await user.save();
  res.json({msg:'Login recorded (simulated)'});
});

module.exports = router;
