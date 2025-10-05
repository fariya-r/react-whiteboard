import React, { useState, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";

export default function HandwritingCanvas({ canvasRef, onRecognizedText }) {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("📥 Loading pre-trained MNIST model...");
        // Pre-trained TF.js MNIST model
        const m = await tf.loadLayersModel(
          `${process.env.PUBLIC_URL}/models/handwriting_model/model.json`
        );
        setModel(m);
        setLoading(false);
        console.log("✅ Model loaded");
      } catch (err) {
        console.error("❌ Error loading model:", err);
      }
    };
    loadModel();
  }, []);

  const preprocessCanvas = () => {
    const canvas = canvasRef.current;
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = 28;
    tmpCanvas.height = 28;
    const tmpCtx = tmpCanvas.getContext("2d");
    tmpCtx.drawImage(canvas, 0, 0, 28, 28);

    const imgData = tmpCtx.getImageData(0, 0, 28, 28);
    const arr = [];
    for (let i = 0; i < imgData.data.length; i += 4) {
      const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
      arr.push(avg / 255.0);
    }

    return tf.tensor4d(arr, [1, 28, 28, 1]);
  };

  const recognizeHandwriting = async () => {
    if (!model) return;
    const input = preprocessCanvas();
    const prediction = model.predict(input);
    const pIndex = prediction.argMax(-1).dataSync()[0];
    if (onRecognizedText) onRecognizedText(pIndex.toString());
    input.dispose();
    prediction.dispose();
  };

  return (
    <button
      onClick={recognizeHandwriting}
      disabled={loading}
      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
    >
      {loading ? "Loading model..." : "Recognize"}
    </button>
  );
}
