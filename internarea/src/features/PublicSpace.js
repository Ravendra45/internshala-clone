
import React, {useEffect, useState} from 'react';
import axios from 'axios';
export default function PublicSpace(){
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const userId = localStorage.getItem('userId') || '';
  useEffect(()=>{ fetchPosts(); },[]);
  async function fetchPosts(){
    const res = await axios.get('/api/posts');
    setPosts(res.data);
  }
  async function submit(e){
    e.preventDefault();
    const fd = new FormData();
    fd.append('userId', userId);
    fd.append('text', text);
    if(file) fd.append('media', file);
    try{
      await axios.post('/api/posts', fd);
      setText(''); setFile(null);
      fetchPosts();
      alert('Posted');
    }catch(err){
      alert(err.response?.data?.msg || 'Error');
    }
  }
  return (<div>
    <h3>Public Space</h3>
    <form onSubmit={submit}>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder='Say something' />
      <br />
      <input type='file' onChange={e=>setFile(e.target.files[0])} />
      <br />
      <button>Post</button>
    </form>
    <hr />
    {posts.map(p=>(
      <div key={p._id} style={{border:'1px solid #ccc', padding:10, marginBottom:10}}>
        <div><b>Author:</b> {p.author}</div>
        <div>{p.text}</div>
        {p.media && <div>Media: {p.media}</div>}
      </div>
    ))}
  </div>);
}
