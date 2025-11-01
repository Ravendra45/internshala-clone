import axios from 'axios';
import React from 'react';

function loadRazorpay() {
  return new Promise((res) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = res;
    document.body.appendChild(script);
  });
}

export default function Subscriptions({ userId }) {
  const plans = [{key:'free',label:'Free',price:0},{key:'bronze',label:'Bronze',price:100},{key:'silver',label:'Silver',price:300},{key:'gold',label:'Gold',price:1000}];

  async function subscribe(plan){
    if(plan === 'free'){
      // instant assignment on backend
      await axios.post('/api/subscription/verify', { userId, plan, razorpay_payment_id: null, razorpay_order_id: 'free', razorpay_signature: 'free' });
      alert('Free plan set');
      return;
    }
    try{
      await loadRazorpay();
      const res = await axios.post('/api/subscription/create-order', { userId, plan });
      const { order } = res.data;
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || '<YOUR_CLIENT_KEY>',
        amount: order.amount,
        currency: order.currency,
        name: 'Internshala Clone',
        description: `${plan} plan`,
        order_id: order.id,
        handler: async function (response){
          // send verification to backend
          await axios.post('/api/subscription/verify', {
            userId, plan,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
          alert('Subscription activated');
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    }catch(err){
      alert(err.response?.data?.msg || err.message);
    }
  }

  return <div>
    {plans.map(p=>(
      <div key={p.key}>
        <h4>{p.label} — ₹{p.price}/month</h4>
        <button onClick={()=>subscribe(p.key)}>Subscribe</button>
      </div>
    ))}
  </div>;
}
