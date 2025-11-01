
import React, {useState} from 'react';
import axios from 'axios';
export default function ResumeBuilder(){
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(0);
  const [resume, setResume] = useState({name:'', qualification:'', experience:'', details:''});
  async function requestOtp(e){
    e.preventDefault();
    const res = await axios.post('/api/resume/request-otp', {email});
    alert(res.data.msg + ' (demo shows OTP in response)');
    setStep(1);
  }
  async function pay(e){
    e.preventDefault();
    // simulate payment
    const userId = localStorage.getItem('userId') || '';
    const res = await axios.post('/api/resume/pay', {userId, resumeData:resume});
    alert(res.data.msg);
  }
  return (<div>
    <h3>Resume Builder (₹50 per resume)</h3>
    {step===0 && (<form onSubmit={requestOtp}>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder='Email for OTP' />
      <button>Request OTP</button>
    </form>)}
    {step===1 && (<div>
      <p>Enter resume details:</p>
      <input placeholder='Name' value={resume.name} onChange={e=>setResume({...resume, name:e.target.value})} /><br/>
      <input placeholder='Qualification' value={resume.qualification} onChange={e=>setResume({...resume, qualification:e.target.value})} /><br/>
      <textarea placeholder='Experience' value={resume.experience} onChange={e=>setResume({...resume, experience:e.target.value})} /><br/>
      <button onClick={pay}>Pay ₹50 & Generate Resume</button>
    </div>)}
  </div>);
}
