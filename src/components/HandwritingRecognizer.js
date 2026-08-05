import React, { useState } from 'react';

const HandwritingRecognizer = ({ canvasRef, onTextRecognized }) => {
  const [loading, setLoading] = useState(false);

  const apiBaseUrl =
    window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : '';

  const recognizeText = async () => {
    console.log("1. Button clicked");

    if (!canvasRef.current) {
      console.log("Canvas ref missing");
      return;
    }

    setLoading(true);

    try {
      console.log("2. Preparing canvas image...");

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      tempCanvas.width = 1000;
      tempCanvas.height = 500;

      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, 1000, 500);

tempCtx.drawImage(
  canvasRef.current,
  0, 0, 1500, 800,   // source area
  0, 0, 1000, 500    // destination
);
      const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.7);
      console.log("3. dataUrl generated:", dataUrl.substring(0, 50));

      const base64Image = dataUrl.replace(
        /^data:image\/jpeg;base64,/,
        ''
      );

      console.log("4. Sending request...");

      const res = await fetch(`${apiBaseUrl}/api/handwriting/recognize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image }),
      });

      console.log("5. Response status:", res.status);

      const rawResponse = await res.text();
      console.log("6. Raw backend response:", rawResponse);

      let parsed = {};
      try {
        parsed = JSON.parse(rawResponse);
      } catch (e) {
        console.log("Response is not JSON");
      }

      console.log("7. Parsed response:", parsed);
      console.log("8. Recognized text:", parsed.text);

      onTextRecognized(parsed.text || '');

    } catch (err) {
      console.error("Recognition failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={recognizeText}
      disabled={loading}
      className="bg-blue-500 text-white px-3 py-2 rounded"
    >
      {loading ? 'Recognizing...' : 'Recognize Handwriting'}
    </button>
  );
};

export default HandwritingRecognizer;