const express = require('express');
const axios = require('axios');
const router = express.Router();
const Message = require('../models/Message');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

router.post('/generate', async (req, res) => {
  const { recipientType, tone, purpose } = req.body;
  const prompt = `Write a ${tone} email to a ${recipientType} about ${purpose}.`;

  try {
    const geminiRes = await axios.post(
      GEMINI_URL,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        params: {
          key: GEMINI_API_KEY
        }
      }
    );

    const generatedText = geminiRes.data.candidates[0]?.content?.parts[0]?.text || "No response.";

    // Save to DB
    const message = new Message({ recipientType, tone, purpose, prompt, response: generatedText });
    await message.save();

    res.status(200).json({ success: true, response: generatedText });
  } catch (error) {
    console.error('Gemini error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Failed to generate message.' });
  }
});

const setMessageRoutes = (app) => {
  app.use('/api/message', router);
};

module.exports = { setMessageRoutes };