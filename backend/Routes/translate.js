// backend/Routes/translate.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

const LIBRE_URL = process.env.LIBRETRANSLATE_API_URL || 'https://libretranslate.com/translate';

router.post('/translate', async (req, res) => {
  const { text, target } = req.body;

  try {
    const response = await axios.post(LIBRE_URL, {
      q: text,
      source: 'auto', // automatically detect the source language
      target,
      format: 'text'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json({ translated: response.data.translatedText });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
});

module.exports = router;
