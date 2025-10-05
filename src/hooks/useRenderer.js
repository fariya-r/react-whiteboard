// src/hooks/useRenderer.js
import { useEffect } from 'react';

const useRenderer = (canvasRef, contextRef, backgroundSnapshot, shapes, lines) => {
    useEffect(() => {
        const ctx = contextRef.current;
        if (!ctx) return;

        const render = () => {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            if (backgroundSnapshot) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    // ✅ All other drawing logic now happens AFTER the background is loaded
                    drawVectorShapes();
                    drawLines();
                };
                img.src = backgroundSnapshot;
            } else {
                // If there's no background snapshot, draw shapes and lines immediately
                drawVectorShapes();
                drawLines();
            }
        };

        const drawVectorShapes = () => {
            shapes.forEach(shape => {
                ctx.beginPath();
                ctx.strokeStyle = shape.color;
                ctx.lineWidth = shape.lineWidth;
                // ... your shape drawing logic here ...
            });
        };

        const drawLines = () => {
            lines.forEach(line => {
                // ... your line drawing logic here ...
            });
        };

        render();
    }, [backgroundSnapshot, shapes, lines, contextRef]);
};

export default useRenderer;