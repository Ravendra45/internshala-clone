import React, {useState} from 'react';
import axios from 'axios';

export default function ResumeBuilder({ userId }){
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({});
  const [otp, setOtp] = useState('');

  async function requestOtp(){
    const res = await axios.post('/api/resume/request-otp', { userId });
    alert(res.data.msg);
    setStep(2);
  }

  async function verifyOtp(){
    const res = await axios.post('/api/resume/verify-otp', { userId, code: otp });
    const { order } = res.data;
    // load razorpay and open checkout
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
    script.onload = () => {
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || '<YOUR_KEY>',
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        handler: async (response) => {
          // finalize
          await axios.post('/api/resume/complete', {
            userId, resumeData: form,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
          alert('Resume created and attached to profile!');
          setStep(4);
        }
      };
      new window.Razorpay(options).open();
    };
  }

  if (step === 1) return (
    <div>
      <h3>Resume form</h3>
      <input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})} />
      <input placeholder="Qualification" onChange={e=>setForm({...form,qualification:e.target.value})} />
      <textarea placeholder="Experience" onChange={e=>setForm({...form,experience:e.target.value})} />
      <input type="file" onChange={e=>setForm({...form,photo:e.target.files[0]})} />
      <button onClick={requestOtp}>Request OTP to pay ₹50</button>
    </div>
  );

  if (step === 2) return (
    <div>
      <h3>Enter OTP sent to your email</h3>
      <input value={otp} onChange={e=>setOtp(e.target.value)} />
      <button onClick={verifyOtp}>Verify & Pay</button>
    </div>
  );

  return <div>Done</div>;
}
