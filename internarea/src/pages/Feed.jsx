import React, {useState, useEffect} from 'react';
import axios from 'axios';

export default function Feed({ userId }){
  const [posts,setPosts] = useState([]);
  const [text,setText] = useState('');
  const [file,setFile] = useState(null);

  useEffect(()=>{ fetchPosts() },[]);

  async function fetchPosts(){
    const res = await axios.get('/api/posts');
    setPosts(res.data);
  }

  async function submit(e){
    e.preventDefault();
    const fd = new FormData();
    fd.append('userId', userId);
    fd.append('text', text);
    if (file) fd.append('media', file);
    try{
      await axios.post('/api/posts', fd, { headers: {'Content-Type':'multipart/form-data'} });
      setText(''); setFile(null);
      fetchPosts();
    }catch(err){
      alert(err.response?.data?.msg || err.message);
    }
  }

  async function like(postId){
    await axios.post(`/api/posts/${postId}/like`, { userId });
    fetchPosts();
  }

  async function comment(postId, comment){
    await axios.post(`/api/posts/${postId}/comment`, { userId, text: comment });
    fetchPosts();
  }

  return <div>
    <form onSubmit={submit}>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Share..." />
      <input type="file" onChange={e=>setFile(e.target.files[0])} />
      <button type="submit">Post</button>
    </form>

    <div>
      {posts.map(p=>(
        <div key={p._id} style={{border:'1px solid #ccc', margin:8,padding:8}}>
          <div>{p.author.name} - {new Date(p.createdAt).toLocaleString()}</div>
          <div>{p.text}</div>
          {p.mediaUrl && (p.mediaType==='image' ? <img src={p.mediaUrl} style={{maxWidth:300}}/> : <video src={p.mediaUrl} controls style={{maxWidth:300}}/>)}
          <div>Likes: {p.likes.length} <button onClick={()=>like(p._id)}>Like</button></div>
          <div>
            Comments:
            {p.comments.map(c=> <div key={c._id}>{c.text}</div>)}
            <form onSubmit={e=>{ e.preventDefault(); const cm = e.target.comment.value; comment(p._id, cm); e.target.reset(); }}>
              <input name="comment" placeholder="add comment"/>
              <button>Comment</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  </div>;
}
