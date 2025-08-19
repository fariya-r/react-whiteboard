// src/hooks/useRenderer.js
import { useEffect } from 'react';

const useRenderer = (canvasRef, contextRef, backgroundSnapshot, shapes, lines) => {
    useEffect(() => {
        const ctx = contextRef.current;
        if (!ctx) return;

        const render = () => {
            // 1. Clear the canvas
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            // 2. Draw the background snapshot (pen/eraser lines)
            if (backgroundSnapshot) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                };
                img.src = backgroundSnapshot;
            }

            // 3. Draw the vector shapes
            shapes.forEach(shape => {
                ctx.beginPath();
                ctx.strokeStyle = shape.color;
                ctx.lineWidth = shape.lineWidth;

                if (shape.type === 'rectangle') {
                    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                } else if (shape.type === 'circle') {
                    const radius = Math.sqrt(Math.pow(shape.width, 2) + Math.pow(shape.height, 2)) / 2;
                    const centerX = shape.x + shape.width / 2;
                    const centerY = shape.y + shape.height / 2;
                    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                    ctx.stroke();
                }
                // Add logic for other shapes (line, arrow)
            });
            
            // 4. Draw other elements like lines from socket
            lines.forEach(line => {
                // ... line rendering logic
            });
        };

        render();
    }, [backgroundSnapshot, shapes, lines, contextRef]);
};

export default useRenderer;