const crypto = require('crypto');

function generatePassword(length = 10){
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let res = '';
  for(let i=0;i<length;i++){
    res += letters[Math.floor(Math.random()*letters.length)];
  }
  return res;
}

function generateOTP(digits = 6){
  return ('' + Math.floor(Math.random() * Math.pow(10, digits))).padStart(digits, '0');
}

module.exports = { generatePassword, generateOTP };
