const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // could be adapted to S3

// helper to get start of day in IST
const moment = require('moment-timezone');
function istStartOfDay() {
  return moment().tz('Asia/Kolkata').startOf('day').toDate();
}

router.post('/', upload.single('media'), async (req,res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if(!user) return res.status(404).json({msg:'User not found'});

    // compute allowed posts
    const friendsCount = (user.friends||[]).length;
    let allowed = 1;
    if (friendsCount === 2) allowed = 2;
    if (friendsCount > 10) allowed = Infinity;

    // count posts today
    const start = istStartOfDay();
    const todayCount = await Post.countDocuments({ author: userId, createdAt: { $gte: start } });

    if (todayCount >= allowed) return res.status(429).json({ msg: 'post limit reached for today' });

    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const mediaType = req.file ? (req.file.mimetype.startsWith('video')?'video':'image') : null;

    const post = new Post({
      author: userId,
      text: req.body.text,
      mediaUrl,
      mediaType
    });
    await post.save();
    res.json({msg:'ok', post});
  } catch(e){ console.error(e); res.status(500).json({error:e.message}); }
});

// fetch feed
router.get('/', async (req,res) => {
  const posts = await Post.find().populate('author','name email').sort({createdAt:-1}).limit(100);
  res.json(posts);
});

// like/unlike
router.post('/:id/like', async (req,res) => {
  const { userId } = req.body;
  const post = await Post.findById(req.params.id);
  if(!post) return res.status(404).send('post not found');
  const idx = post.likes.indexOf(userId);
  if (idx === -1) post.likes.push(userId);
  else post.likes.splice(idx,1);
  await post.save();
  res.json(post);
});

// comment
router.post('/:id/comment', async (req,res) => {
  const { userId, text } = req.body;
  const post = await Post.findById(req.params.id);
  if(!post) return res.status(404).send('post not found');
  post.comments.push({ user: userId, text });
  await post.save();
  res.json(post);
});

module.exports = router;
