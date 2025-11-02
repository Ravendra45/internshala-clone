const express = require('express');
const router = express.Router();

// Lazy-initialize Razorpay client so missing env vars don't crash the process
let razorpayClient = null;
function getRazorpayClient() {
  if (razorpayClient) return razorpayClient;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    console.warn('Razorpay keys missing. Payment endpoints will respond 503 until configured.');
    return null;
  }

  const Razorpay = require('razorpay'); // require lazily
  razorpayClient = new Razorpay({
    key_id,
    key_secret,
  });
  return razorpayClient;
}

// Example route using Razorpay — adapt to your existing routes
router.post('/create-order', async (req, res, next) => {
  try {
    const rzp = getRazorpayClient();
    if (!rzp) {
      return res.status(503).json({ error: 'Razorpay not configured on server.' });
    }
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount required' });

    const options = {
      amount: Number(amount) * 100,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`
    };

    const order = await rzp.orders.create(options);
    return res.json(order);
  } catch (err) {
    next(err);
  }
});

// export router (keep your other routes below or merge)
module.exports = router;
