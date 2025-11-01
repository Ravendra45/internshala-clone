
import React from 'react';
import axios from 'axios';
export default function Subscriptions(){
  const userId = localStorage.getItem('userId') || '';
  async function subscribe(plan){
    try{
      const res = await axios.post('/api/subscription/subscribe', {userId, plan});
      alert(res.data.msg);
    }catch(err){
      alert(err.response?.data?.msg || 'Error');
    }
  }
  return (<div>
    <h3>Subscriptions (payments allowed 10-11 AM IST)</h3>
    <div>
      <button onClick={()=>subscribe('free')}>Free (Apply 1)</button>
      <button onClick={()=>subscribe('bronze')}>Bronze ₹100/month (Apply 3)</button>
      <button onClick={()=>subscribe('silver')}>Silver ₹300/month (Apply 5)</button>
      <button onClick={()=>subscribe('gold')}>Gold ₹1000/month (Unlimited)</button>
    </div>
  </div>);
}
