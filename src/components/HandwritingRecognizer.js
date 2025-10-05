// HandwritingRecognizer.jsx
import React, { useState } from 'react';

const HandwritingRecognizer = ({ canvasRef, onTextRecognized }) => {
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.REACT_APP_GOOGLE_VISION_API_KEY;

  const recognizeText = async () => {
    if (!canvasRef.current) return;
  
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const base64Image = dataUrl.replace(/^data:image\/png;base64,/, '');
  
    try {
      const res = await fetch('/api/handwriting/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image })
      });
      const data = await res.json();
      onTextRecognized(data.text || '');
    } catch (err) {
      console.error('Handwriting recognition failed:', err);
      onTextRecognized('');
    }
  };
  
  

  return (
    <button
      onClick={recognizeText}
      className="bg-blue-500 text-white px-3 py-2 rounded"
      disabled={loading}
    >
      {loading ? 'Recognizing...' : 'Recognize Handwriting'}
    </button>
  );
};

export default HandwritingRecognizer;
