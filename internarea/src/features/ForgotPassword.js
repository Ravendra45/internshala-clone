
import React, {useState} from 'react';
import axios from 'axios';
export default function ForgotPassword(){
  const [email, setEmail] = useState('');
  async function submit(e){ e.preventDefault();
    try{
      const res = await axios.post('/api/auth/forgot', {email});
      alert(res.data.msg);
    }catch(err){
      alert(err.response?.data?.msg || 'Error');
    }
  }
  return (<div>
    <h3>Forgot Password (once per day)</h3>
    <form onSubmit={submit}>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder='Email' />
      <button>Reset</button>
    </form>
    <div>
      <h4>Password Generator (sample)</h4>
      <button onClick={()=>{
        const letters='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let out=''; for(let i=0;i<10;i++) out+=letters[Math.floor(Math.random()*letters.length)];
        alert('Generated: '+out);
      }}>Generate Password</button>
    </div>
  </div>);
}
