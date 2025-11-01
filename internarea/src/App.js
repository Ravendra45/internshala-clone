
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PublicSpace from './features/PublicSpace';
import ForgotPassword from './features/ForgotPassword';
import Subscriptions from './features/Subscriptions';
import ResumeBuilder from './features/ResumeBuilder';
import LanguageSelector from './features/LanguageSelector';
import LoginHistory from './features/LoginHistory';

function App(){
  return (
    <BrowserRouter>
      <div style={{padding:20}}>
        <h2>Internshala Clone - Modified</h2>
        <nav>
          <Link to='/'>Public Space</Link> | <Link to='/forgot'>Forgot Password</Link> | <Link to='/subs'>Subscriptions</Link> | <Link to='/resume'>Resume Builder</Link> | <Link to='/lang'>Language</Link> | <Link to='/history'>Login History</Link>
        </nav>
        <hr />
        <Routes>
          <Route path='/' element={<PublicSpace/>} />
          <Route path='/forgot' element={<ForgotPassword/>} />
          <Route path='/subs' element={<Subscriptions/>} />
          <Route path='/resume' element={<ResumeBuilder/>} />
          <Route path='/lang' element={<LanguageSelector/>} />
          <Route path='/history' element={<LoginHistory/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;
