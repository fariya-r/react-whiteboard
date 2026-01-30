import { useState, useCallback } from "react";

/**
 * 3D Shapes Hook (LYNX-style)
 */
const use3DShapes = (
  canvasRef,
  contextRef,
  getScaledCoordinates,
  saveSnapshot
) => {
  const [shapes3D, setShapes3D] = useState([]);
  const [activeShape, setActiveShape] = useState(null);
  const [isDrawing3D, setIsDrawing3D] = useState(false);

  /* ---------- helpers ---------- */
  const shadeColor = (color, percent) => {
    let num = parseInt(color.replace("#",""),16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = (num >> 8 & 0x00FF) + amt,
      B = (num & 0x0000FF) + amt;

    return "#" + (
      0x1000000 +
      (R<255?R<1?0:R:255)*0x10000 +
      (G<255?G<1?0:G:255)*0x100 +
      (B<255?B<1?0:B:255)
    ).toString(16).slice(1);
  };

  const drawCube = useCallback((ctx, shape) => {
    const { x, y, width, height, depth, fill, stroke } = shape;

    const topColor = shadeColor(fill, 20);
    const sideColor = shadeColor(fill, -20);

    // front
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    // top
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + depth, y - depth);
    ctx.lineTo(x + width + depth, y - depth);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.fillStyle = topColor;
    ctx.fill();
    ctx.stroke();

    // side
    ctx.beginPath();
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width + depth, y - depth);
    ctx.lineTo(x + width + depth, y + height - depth);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fillStyle = sideColor;
    ctx.fill();
    ctx.stroke();
  }, []);

  /* ---------- mouse handlers ---------- */
  const start3DShape = useCallback((e, color) => {
    const { x, y } = getScaledCoordinates(e);

    setActiveShape({
      id: Date.now(),
      type: "cube",
      x,
      y,
      width: 0,
      height: 0,
      depth: 30,
      fill: color,
      stroke: "#333"
    });

    setIsDrawing3D(true);
  }, [getScaledCoordinates]);

  const update3DShape = useCallback((e) => {
    if (!isDrawing3D || !activeShape) return;
    const { x, y } = getScaledCoordinates(e);

    setActiveShape(prev => ({
      ...prev,
      width: x - prev.x,
      height: y - prev.y
    }));
  }, [isDrawing3D, activeShape, getScaledCoordinates]);

  const finish3DShape = useCallback(() => {
    if (!activeShape) return;

    setShapes3D(prev => [...prev, activeShape]);
    setActiveShape(null);
    setIsDrawing3D(false);
    saveSnapshot();
  }, [activeShape, saveSnapshot]);

  /* ---------- render ---------- */
  const render3DShapes = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx) return;

    shapes3D.forEach(shape => drawCube(ctx, shape));
    if (activeShape) drawCube(ctx, activeShape);
  }, [shapes3D, activeShape, drawCube, contextRef]);

  return {
    shapes3D,
    setShapes3D,
    start3DShape,
    update3DShape,
    finish3DShape,
    render3DShapes,
    isDrawing3D
  };
};

export default use3DShapes;
