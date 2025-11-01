
import React, {useEffect, useState} from 'react';
import axios from 'axios';
export default function LoginHistory(){
  const [history, setHistory] = useState([]);
  useEffect(()=>{ fetch(); },[]);
  async function fetch(){
    const userId = localStorage.getItem('userId') || '';
    const res = await axios.get('/api/demo/user/'+userId);
    setHistory(res.data.loginHistory || []);
  }
  return (<div>
    <h3>Login History</h3>
    {history.map((h,i)=>(
      <div key={i} style={{border:'1px solid #ddd', padding:8, marginBottom:6}}>
        <div><b>At:</b> {h.at}</div>
        <div><b>IP:</b> {h.ip}</div>
        <div><b>User-Agent:</b> {h.ua && h.ua.source}</div>
      </div>
    ))}
  </div>);
}
