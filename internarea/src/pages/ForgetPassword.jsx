import axios from 'axios';
import React, {useState} from 'react';

export default function Forgot(){
  const [email,setEmail] = useState('');
  const [phone,setPhone] = useState('');
  async function submit(e){
    e.preventDefault();
    try{
      const res = await axios.post('/api/auth/forgot', { email: email || undefined, phone: phone || undefined });
      alert(res.data.msg);
    }catch(err){
      alert(err.response?.data?.msg || err.message);
    }
  }
  return <form onSubmit={submit}>
    <h3>Forgot password</h3>
    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (or leave blank)"/>
    <div>Or</div>
    <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone (optional)"/>
    <button type="submit">Reset</button>
  </form>
}
