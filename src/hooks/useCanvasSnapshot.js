import { useCallback } from 'react';

// Naya model: drawing ab pixels mein nahi, world-coordinate vector data
// (strokes, circles, rulerLines, angles) mein hai. Export/save ke liye ab
// hum current viewport pe depend nahi karte — poore board ka bounding box
// nikal kar ek offscreen canvas banate hain jo SAARI content ko fit kare,
// chahe wo abhi screen par visible ho ya na ho.
const useCanvasSnapshot = (backgroundColor, gridStyle, gridSize) => {

    const computeBounds = (strokes = [], circles = [], rulerLines = [], shapes = [], textBoxes = [], stickyNotes = []) => {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const extend = (x, y) => {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        };

        strokes.forEach(s => (s.points || []).forEach(p => extend(p.x, p.y)));
        circles.forEach(c => {
            const r = c.r ?? c.radius ?? 0;
            extend(c.x - r, c.y - r);
            extend(c.x + r, c.y + r);
        });
        rulerLines.forEach(l => { extend(l.x1, l.y1); extend(l.x2, l.y2); });
        shapes.forEach(sh => { extend(sh.x, sh.y); extend(sh.x + (sh.width || 0), sh.y + (sh.height || 0)); });
        textBoxes.forEach(tb => extend(tb.x, tb.y));
        stickyNotes.forEach(sn => { extend(sn.x, sn.y); extend(sn.x + (sn.width || 100), sn.y + (sn.height || 100)); });

        if (!isFinite(minX)) {
            return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
        }

        const PADDING = 50;
        return { minX: minX - PADDING, minY: minY - PADDING, maxX: maxX + PADDING, maxY: maxY + PADDING };
    };

    const drawBackground = (ctx, w, h) => {
        const bgCol = backgroundColor || "#001F54";
        ctx.fillStyle = bgCol;
        ctx.fillRect(0, 0, w, h);

        if (gridStyle === 'empty' || !gridSize) return;

        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;

        if (gridStyle === 'dots') {
            for (let x = 0; x <= w; x += gridSize) {
                for (let y = 0; y <= h; y += gridSize) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        } else {
            for (let x = 0; x <= w; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }
            for (let y = 0; y <= h; y += gridSize) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            }
        }
        ctx.restore();
    };

    const getSnapshotWithElements = useCallback(
        async ({
            strokes = [],
            circles = [],
            rulerLines = [],
            angles = [],
            shapes = [],
            textBoxes = [],
            stickyNotes = [],
        } = {}) => {
            const bounds = computeBounds(strokes, circles, rulerLines, shapes, textBoxes, stickyNotes);
            const rawW = bounds.maxX - bounds.minX;
            const rawH = bounds.maxY - bounds.minY;

            const MAX_DIM = 4000;
            const exportScale = Math.min(1, MAX_DIM / Math.max(rawW, rawH, 1));

            const w = Math.max(1, Math.round(rawW * exportScale));
            const h = Math.max(1, Math.round(rawH * exportScale));

            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = w;
            exportCanvas.height = h;
            const ctx = exportCanvas.getContext('2d');

            drawBackground(ctx, w, h);

            ctx.setTransform(exportScale, 0, 0, exportScale, -bounds.minX * exportScale, -bounds.minY * exportScale);

            strokes.forEach(stroke => {
                if (!stroke.points || stroke.points.length < 2) return;
                ctx.strokeStyle = stroke.color || '#000';
                ctx.lineWidth = stroke.lineWidth || 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                stroke.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
                ctx.stroke();
            });

            circles.forEach(c => {
                ctx.strokeStyle = c.color || '#000';
                ctx.lineWidth = c.lineWidth || 2;
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.r ?? c.radius ?? 0, 0, Math.PI * 2);
                ctx.stroke();
            });

            rulerLines.forEach(line => {
                ctx.strokeStyle = line.color || '#000';
                ctx.lineWidth = line.lineWidth || 2;
                ctx.beginPath();
                ctx.moveTo(line.x1, line.y1);
                ctx.lineTo(line.x2, line.y2);
                ctx.stroke();
            });

            shapes.forEach(sh => {
                ctx.fillStyle = sh.color || 'lightblue';
                ctx.fillRect(sh.x, sh.y, sh.width || 100, sh.height || 100);
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.strokeRect(sh.x, sh.y, sh.width || 100, sh.height || 100);
                if (sh.text) {
                    ctx.fillStyle = '#000';
                    ctx.font = '14px Arial';
                    ctx.fillText(sh.text, sh.x + 5, sh.y + 20);
                }
            });

            textBoxes.forEach(tb => {
                ctx.font = `${tb.fontSize || tb.size || 16}px Arial`;
                ctx.fillStyle = tb.color || '#000';
                ctx.fillText(tb.text || '', tb.x, tb.y);
            });

            stickyNotes.forEach(sn => {
                ctx.fillStyle = sn.color || 'yellow';
                ctx.fillRect(sn.x, sn.y, sn.width || 100, sn.height || 100);
                ctx.fillStyle = '#000';
                ctx.font = '12px Arial';
                ctx.fillText(sn.text || '', sn.x + 5, sn.y + 20);
            });

            return exportCanvas.toDataURL('image/jpeg', 0.8);
        },
        [backgroundColor, gridStyle, gridSize]
    );

    return { getSnapshotWithElements };
};

export default useCanvasSnapshot;