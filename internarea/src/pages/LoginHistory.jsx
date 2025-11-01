import React, {useEffect, useState} from 'react';
import axios from 'axios';

export default function LoginHistory({ userId }){
  const [history, setHistory] = useState([]);
  useEffect(()=>fetch(),[]);
  async function fetch(){
    const res = await axios.get('/api/user/login-history', { params: { userId } });
    setHistory(res.data);
  }
  return <div>
    <h3>Login History</h3>
    {history.map((h,i)=>(
      <div key={i}>
        <div>{new Date(h.time).toLocaleString()}</div>
        <div>IP: {h.ip}</div>
        <div>Browser: {h.userAgent?.browser} / Version: {h.userAgent?.version}</div>
        <div>OS: {h.userAgent?.os} / Platform: {h.userAgent?.platform}</div>
      </div>
    ))}
  </div>
}
