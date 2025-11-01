
import React, {useState} from 'react';
import axios from 'axios';
export default function LanguageSelector(){
  const [text, setText] = useState('Hello, welcome!');
  const [lang, setLang] = useState('en');
  async function translateTo(target){
    const res = await axios.post('/api/translate/translate', {text, target});
    alert(res.data.translated);
    if(target === 'fr'){
      const otp = prompt('Enter OTP sent to email (simulation). Type any to continue.');
      if(!otp) return;
      alert('Language switched to French (simulated)');
    }
  }
  return (<div>
    <h3>Language Selector (6 langs)</h3>
    <p>Text: {text}</p>
    <div>
      <button onClick={()=>translateTo('en')}>English</button>
      <button onClick={()=>translateTo('hi')}>Hindi</button>
      <button onClick={()=>translateTo('es')}>Spanish</button>
      <button onClick={()=>translateTo('pt')}>Portuguese</button>
      <button onClick={()=>translateTo('zh')}>Chinese</button>
      <button onClick={()=>translateTo('fr')}>French (requires OTP)</button>
    </div>
  </div>);
}
