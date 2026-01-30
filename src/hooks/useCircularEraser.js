import { useRef, useCallback } from "react";

const ERASER_RADIUS = 35; // 🔥 BIG ERASER (fixed size)

const useCircularEraser = (canvasRef, contextRef, getScaledCoordinates) => {
  const eraserPos = useRef({ x: 0, y: 0 });

  // draw ghost eraser cursor
  const drawEraserPreview = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(eraserPos.current.x, eraserPos.current.y, ERASER_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();
  }, []);

  const eraseAtPoint = useCallback((x, y) => {
    const ctx = contextRef.current;
    if (!ctx) return;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, ERASER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

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
