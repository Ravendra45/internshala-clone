import React from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function LanguageSwitcher({ userId }) {
  const { i18n } = useTranslation();
  const languages = [{code:'en',label:'English'},{code:'es',label:'Spanish'},{code:'hi',label:'Hindi'},{code:'pt',label:'Portuguese'},{code:'zh',label:'Chinese'},{code:'fr',label:'French'}];

  async function switchLang(code){
    // for french require OTP
    if(code === 'fr'){
      await axios.post('/api/lang/request-fr-otp', { userId });
      const otp = prompt('Enter OTP sent to your email to switch to French:');
      const res = await axios.post('/api/lang/verify-fr-otp', { userId, code: otp });
      if(!res.data.ok) return alert(res.data.msg || 'OTP failed');
    }
    i18n.changeLanguage(code);
  }

  return <select onChange={e=>switchLang(e.target.value)} value={i18n.language}>
    {languages.map(l=> <option key={l.code} value={l.code}>{l.label}</option>)}
  </select>;
}
