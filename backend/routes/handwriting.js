const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/recognize', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

    const body = {
      requests: [
        {
          image: { content: imageBase64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
        }
      ]
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    console.log("Google Vision full response:", JSON.stringify(data, null, 2));
    const text = data.responses?.[0]?.fullTextAnnotation?.text || '';
console.log("Recognized text:", text);
    res.json({ text });

  } catch (err) {
    console.error('Error recognizing handwriting:', err);
    res.status(500).json({ error: 'Failed to recognize handwriting' });
  }
});

module.exports = router;
