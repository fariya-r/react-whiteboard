// src/hooks/useCanvasSnapshot.js
import { useCallback } from 'react';

const useCanvasSnapshot = (canvasRef, contextRef, backgroundSnapshot) => {
    const drawElementsOnCanvas = useCallback(async (shapes = [], strokes = []) => {
        const ctx = contextRef.current;
        const canvas = canvasRef.current;

        if (!ctx || !canvas) {
            console.error('Canvas context or canvas reference not found.');
            return;
        }

        // reset transform and clear
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw background snapshot if exists
        if (backgroundSnapshot) {
            const img = new Image();
            img.src = backgroundSnapshot;
            await new Promise(resolve => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    resolve();
                };
            });
        }

        // ✅ draw freehand strokes
        strokes.forEach(stroke => {
            ctx.strokeStyle = stroke.color || '#000';
            ctx.lineWidth = stroke.lineWidth || 2;
            ctx.beginPath();
            stroke.points.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
        });

      
    }, [canvasRef, contextRef, backgroundSnapshot]);

    const getSnapshotWithElements = useCallback(
        async (textBoxes = [], stickyNotes = [], shapes = [], strokes = []) => {
            await drawElementsOnCanvas(shapes, strokes);

            // ✅ optionally draw textboxes & stickynotes too
            const ctx = contextRef.current;
            textBoxes.forEach(tb => {
                ctx.font = `${tb.fontSize || 16}px Arial`;
                ctx.fillStyle = tb.color || '#000';
                ctx.fillText(tb.text, tb.x, tb.y);
            });

            stickyNotes.forEach(sn => {
                ctx.fillStyle = sn.color || 'yellow';
                ctx.fillRect(sn.x, sn.y, sn.width, sn.height);
                ctx.fillStyle = '#000';
                ctx.fillText(sn.text, sn.x + 5, sn.y + 20);
            });

            return canvasRef.current.toDataURL();
        },
        [drawElementsOnCanvas, canvasRef, contextRef]
    );

    return { getSnapshotWithElements, drawElementsOnCanvas };
};

export default useCanvasSnapshot;
