
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/user/:id', async (req,res)=>{
  const id = req.params.id;
  try{
    const u = await User.findById(id);
    if(!u) return res.status(404).json({});
    res.json({loginHistory: u.loginHistory || []});
  }catch(e){ res.status(500).json({});}
});

module.exports = router;
