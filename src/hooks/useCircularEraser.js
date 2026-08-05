import { useRef, useCallback } from "react";

const ERASER_RADIUS = 35; // world-units mein radius (screen pixels nahi — scale khud handle hoga)

// Naya vector-based eraser: pixels ko destination-out se nahi mitata (kyunke
// canvas ab har pan/zoom pe strokes se dobara render hota hai — pixel-erase
// agle render pe khud hi wapas aa jata). Iski jagah ye seedha `strokes` array
// se un points ko hata deta hai jo eraser radius ke andar aayen, aur zaroorat
// pade to stroke ko do hisso mein split kar deta hai (taake beech se mita hua
// hissa gap ki tarah dikhe, poori stroke na ude).
const useCircularEraser = (canvasRef, contextRef, getScaledCoordinates, strokes, setStrokes, scale = 1, panOffset = { x: 0, y: 0 }, renderCanvas, circles, setCircles) => {
    const eraserPos = useRef({ x: 0, y: 0 });

  // Ghost eraser circle — world coordinates mein screen pe dikhane ke liye
  const drawEraserPreview = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, panOffset.x, panOffset.y);
    ctx.beginPath();
    ctx.arc(eraserPos.current.x, eraserPos.current.y, ERASER_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1 / scale;
    ctx.setLineDash([4 / scale, 4 / scale]);
    ctx.stroke();
    ctx.restore();
  }, [contextRef, scale, panOffset]);

  const distToSegment = (px, py, x1, y1, x2, y2) => {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let t = lenSq !== 0 ? dot / lenSq : -1;
    t = Math.max(0, Math.min(1, t));
    const xx = x1 + t * C, yy = y1 + t * D;
    return Math.hypot(px - xx, py - yy);
  };

  const eraseAtPoint = useCallback((x, y) => {
    // ✅ Compass circles: poora delete karne ki bajaye, jis circle ki boundary
    // eraser ke qareeb aaye usay ek polyline (points ka band) mein convert kar do,
    // taake neeche wala segment-split logic (jo strokes ke liye hai) usay bhi
    // partially erase kar sake — bilkul pen-line jaisa.
    if (setCircles && setStrokes) {
      setCircles(prevCircles => {
        const remaining = [];
        const convertedArcs = [];

        prevCircles.forEach(c => {
          const r = c.r ?? c.radius ?? 0;
          const distToCenter = Math.hypot(c.x - x, c.y - y);
          const distToEdge = Math.abs(distToCenter - r);

          if (distToEdge <= ERASER_RADIUS) {
            // Circle ko band (closed loop) polyline mein sample karo
            const segments = 128;
            const points = [];
            for (let i = 0; i <= segments; i++) {
              const theta = (i / segments) * Math.PI * 2;
              points.push({ x: c.x + r * Math.cos(theta), y: c.y + r * Math.sin(theta) });
            }
            convertedArcs.push({
              id: `${c.id}-arc-${Date.now()}`,
              points,
              color: c.color || '#000',
              lineWidth: c.lineWidth || 2,
            });
          } else {
            remaining.push(c);
          }
        });

        if (convertedArcs.length > 0) {
          setStrokes(prev => [...prev, ...convertedArcs]);
        }

        return remaining;
      });
    }

    if (!setStrokes) return;

    setStrokes(prevStrokes => {
      const result = [];

      prevStrokes.forEach(stroke => {
        const pts = stroke.points;
        if (!pts || pts.length < 2) {
          if (pts && pts.length === 1 && Math.hypot(pts[0].x - x, pts[0].y - y) <= ERASER_RADIUS) {
            return; // erase kar do (skip / drop this stroke)
          }
          result.push(stroke);
          return;
        }

        // Stroke ko segments mein todo, jo segment eraser radius ke andar aaye usay hata do,
        // baaki ko alag-alag sub-strokes bana kar rakh lo (gap dikhane ke liye)
        let currentPoints = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
          const p1 = pts[i - 1];
          const p2 = pts[i];
          const hit = distToSegment(x, y, p1.x, p1.y, p2.x, p2.y) <= ERASER_RADIUS;

          if (hit) {
            if (currentPoints.length > 1) {
              result.push({ ...stroke, id: `${stroke.id}-${result.length}`, points: currentPoints });
            }
            currentPoints = [];
          } else {
            currentPoints.push(p2);
          }
        }
        if (currentPoints.length > 1) {
          result.push({ ...stroke, id: `${stroke.id}-${result.length}`, points: currentPoints });
        }
      });

      return result;
    });

    if (renderCanvas) renderCanvas();
  }, [setStrokes, renderCanvas]);

  const handleEraserMove = useCallback((e) => {
    const { x, y } = getScaledCoordinates(e);
    eraserPos.current = { x, y };
  }, [getScaledCoordinates]);

  return {
    ERASER_RADIUS,
    eraserPos,
    drawEraserPreview,
    eraseAtPoint,
    handleEraserMove,
  };
};

export default useCircularEraser;