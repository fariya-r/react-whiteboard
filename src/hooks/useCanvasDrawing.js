import { useState, useEffect, useCallback, useRef } from 'react';
import useCircularEraser from "./useCircularEraser";

// ============================================================================
// NAYA MODEL: har cheez (pen strokes, ruler lines, compass circles, angles)
// world-coordinates mein "elements" array mein store hoti hai — pixels mein
// nahi. Canvas sirf ek viewport-size "window" hai jo har render pe
// scale+panOffset transform laga kar in elements ko screen pe dikhata hai.
// Isi wajah se ab canvas TRULY unbounded hai — kitna bhi door pan karo,
// purani drawing hamesha data mein mehfooz hai aur wapas render ho jati hai.
// ============================================================================

const useCanvasDrawing = (
  canvasRef,
  contextRef,
  scale = 1,
  panOffset = { x: 0, y: 0 },
  sessionId,
  socket,
  backgroundSnapshot,
  setBackgroundSnapshot,
  compassPosition,
  setCompassPosition,
  isDraggingCompass,
  setIsDraggingCompass,
  dragStartOffset,
  setDragStartOffset,
  compassAngle,
  setCompassAngle,
  shapes,
  setShapes,
  isDrawingCircle,
  setIsDrawingCircle,
  pivotPoint,
  setPivotPoint,
  currentPoint,
  setCurrentPoint,
  rulerAngle,
  setRulerAngle,
  history,
  setHistory,
  redoStack,
  setRedoStack,
  threeD
) => {
  const [tool, setTool] = useState('pen');
  const [rulerStart, setRulerStart] = useState(null);
  const [rulerEnd, setRulerEnd] = useState(null);
  const [isRulerDrawing, setIsRulerDrawing] = useState(false);
  const threeDRef = useRef(null);

  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [stickyNotes, setStickyNotes] = useState([]);

  const COMPASS_WIDTH = 100;
  const COMPASS_HEIGHT = 100;
  const [protractorPosition, setProtractorPosition] = useState({ x: 200, y: 200 });
  const [isDraggingProtractor, setIsDraggingProtractor] = useState(false);
  const [protractorRadius, setProtractorRadius] = useState(120);
  const [rulerLineStart, setRulerLineStart] = useState(null);
  const [rulerLineEnd, setRulerLineEnd] = useState(null);

  // ---- PERSISTENT WORLD-COORDINATE DATA (yehi ab "asal" drawing hai) ----
  const [strokes, setStrokes] = useState([]);       // pen strokes: {id, points:[{x,y}], color, lineWidth}
  const [circles, setCircles] = useState([]);       // compass circles: {id, x, y, r, color, lineWidth}
  const [rulerLines, setRulerLines] = useState([]); // finalized ruler lines: {id, x1,y1,x2,y2, color, lineWidth, label}
  const [angles, setAngles] = useState([]);         // protractor angles: {id, centerX, centerY, radius, startAngle, endAngle}

  // Undo/redo — ek single chronological log, taake har tool type ka undo sahi order mein ho
  const [actionLog, setActionLog] = useState([]);       // [{type, id}]
  const [redoActionStack, setRedoActionStack] = useState([]); // [{type, id, element}]

  // Live drawing ke dauran current stroke yahan (ref mein) rakhte hain — state mein nahi,
  // taake har mousemove pe React re-render na ho (performance ke liye)
  const currentStrokeRef = useRef(null);

  useEffect(() => {
    if (threeD) threeDRef.current = threeD;
  }, [threeD]);

  // ---- Core render: canvas ko clear karke, transform laga kar sab elements dobara draw karta hai ----
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, panOffset.x, panOffset.y);

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
      if (line.label) {
        ctx.fillStyle = 'red';
        ctx.font = `${12 / scale}px Arial`; // zoom se independent, hamesha readable
        ctx.textAlign = 'center';
        ctx.fillText(line.label, (line.x1 + line.x2) / 2, (line.y1 + line.y2) / 2 - 10 / scale);
      }
    });

    angles.forEach(a => drawAngle(ctx, a.centerX, a.centerY, a.radius, a.startAngle, a.endAngle));
  }, [canvasRef, contextRef, scale, panOffset, strokes, circles, rulerLines, angles]);

  // Har baar jab pan/zoom/data badle, poora canvas dobara render karo
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const getScaledCoordinates = useCallback((e) => {
    if (!e || !canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const currentPanX = panOffset?.x || 0;
    const currentPanY = panOffset?.y || 0;
    const currentScale = scale || 1;

    // Canvas ab viewport-fixed hai (khud move nahi hota), is liye world-coordinate
    // nikalne ke liye panOffset/scale manually subtract/divide karna zaroori hai
    const x = (clientX - rect.left - currentPanX) / currentScale;
    const y = (clientY - rect.top - currentPanY) / currentScale;

    return { x, y };
  }, [canvasRef, scale, panOffset]);

  const {
    drawEraserPreview,
    eraseAtPoint,
    handleEraserMove
  } = useCircularEraser(canvasRef, contextRef, getScaledCoordinates, strokes, setStrokes, scale, panOffset, renderCanvas, circles, setCircles);

  const handleUpdateStickyNoteSize = useCallback((id, newSize) => {
    setStickyNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, width: newSize.width, height: newSize.height } : note
      )
    );
  }, []);

  const isInsideCompass = useCallback((x, y) => {
    const compX = compassPosition.x;
    const compY = compassPosition.y;
    return x >= compX && x <= compX + COMPASS_WIDTH && y >= compY && y <= compY + COMPASS_HEIGHT;
  }, [compassPosition]);

  const handleProtractorDrag = useCallback((x, y) => {
    setProtractorPosition({ x, y });
  }, []);

  const finalizeAngle = useCallback((angleData) => {
    if (!angleData) return;
   
    const centerX = angleData.centerX ?? protractorPosition.x;
    const centerY = angleData.centerY ?? protractorPosition.y;
    const radius = angleData.radius ?? protractorRadius;
    const startAngle = 0;
    const endAngle = (-angleData.angle * Math.PI) / 180;

    const newAngle = { id: `angle-${Date.now()}`, centerX, centerY, radius, startAngle, endAngle };
    setAngles(prev => [...prev, newAngle]);
    setActionLog(prev => [...prev, { type: 'angle', id: newAngle.id }]);
    setRedoActionStack([]);
  }, [protractorPosition, protractorRadius]);

  function drawAngle(ctx, centerX, centerY, radius, startAngle, endAngle) {
    // ✅ Purane size (radius*1.2 ≈ 300px) se thora sa kam — fixed 180px,
    // taake protractor jaisa bara na ho lekin readable/proportional rahe
    const lineLength = 180;
    const arrowSize = 10;
    const arcRadius = 45;
    const lineColor = "#FFD700";  // gold
    const arcColor = "#00E676";   // bright green
    const textColor = "#FFFFFF";  // white

    ctx.beginPath();
    const startLineX = centerX + lineLength * Math.cos(startAngle);
    const startLineY = centerY + lineLength * Math.sin(startAngle);
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(startLineX, startLineY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawArrowhead(ctx, startLineX, startLineY, startAngle, arrowSize, lineColor);

    ctx.beginPath();
    const endLineX = centerX + lineLength * Math.cos(endAngle);
    const endLineY = centerY + lineLength * Math.sin(endAngle);
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endLineX, endLineY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawArrowhead(ctx, endLineX, endLineY, endAngle, arrowSize, lineColor);

    let spanAngle = endAngle - startAngle;
    if (spanAngle < 0) spanAngle += 2 * Math.PI;
    const angleDeg = Math.round(spanAngle * 180 / Math.PI);

    ctx.beginPath();
    ctx.arc(centerX, centerY, arcRadius, startAngle, endAngle, angleDeg > 180);
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    const displayedAngle = Math.abs(Math.round(endAngle * 180 / Math.PI));
    let midAngle = (startAngle + endAngle) / 2;
    if (displayedAngle > 180) midAngle = (endAngle + Math.PI);

    const labelX = centerX + (arcRadius + 15) * Math.cos(midAngle);
    const labelY = centerY + (arcRadius + 15) * Math.sin(midAngle);

    ctx.fillStyle = textColor;
    ctx.font = "bold 14px Arial";
    ctx.fillText(displayedAngle + "°", labelX, labelY);
  }

 function drawArrowhead(ctx, x, y, angle, size, color = "#FFD700") {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size / 2);
    ctx.lineTo(-size, size / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  // Legacy helper — ab sirf preview ke liye, asal draw renderCanvas se hoti hai
  const drawCircleOnCanvas = (x, y, radius, startAngle, endAngle) => {
    const ctx = contextRef.current;
    if (!ctx) return;
    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;
    ctx.beginPath();
    ctx.arc(x, y, radius, startRadians, endRadians);
    ctx.stroke();
  };

  const startDrawing = useCallback((e) => {
    if (!contextRef.current || tool === 'text') return;
    const { x, y } = getScaledCoordinates(e);
    const ctx = contextRef.current;

    if (tool === 'compass') {
      if (isInsideCompass(x, y)) {
        setIsDraggingCompass(true);
        setDragStartOffset({ x: x - compassPosition.x, y: y - compassPosition.y });
      }
      return;
    }

    if (tool === 'pen') {
      const strokeId = `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      currentStrokeRef.current = { id: strokeId, points: [{ x, y }], color, lineWidth };

      // Live feedback: turant is stroke ko screen pe draw karo (transform already renderCanvas se laga hua hai)
      ctx.setTransform(scale, 0, 0, scale, panOffset.x, panOffset.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      return;
    }

    if (tool === 'eraser') {
      setIsDrawing(true);
      return;
    }

    if (tool === 'rulerLine') {
      setRulerLineStart({ x, y });
      setRulerLineEnd({ x, y });
      setIsRulerDrawing(true);
    } else if (tool === 'stickyNote') {
      const newNote = { id: Date.now(), x, y, text: '', color: '#ffff00' };
      setStickyNotes(prevNotes => [...prevNotes, newNote]);
    }

    if (socket) {
      socket.emit('drawing', { room: sessionId, action: 'start', x, y, tool, color, lineWidth });
    }
  }, [contextRef, tool, getScaledCoordinates, socket, sessionId, color, lineWidth, compassPosition, isInsideCompass, setDragStartOffset, setIsDraggingCompass, scale, panOffset]);

  function rotatePoint(x, y, centerX, centerY, angle) {
    const rad = (angle * Math.PI) / 180;
    const dx = x - centerX;
    const dy = y - centerY;
    return {
      x: centerX + dx * Math.cos(rad) - dy * Math.sin(rad),
      y: centerY + dx * Math.sin(rad) + dy * Math.cos(rad),
    };
  }

  const drawLine = useCallback((e) => {
    if (!isDrawing || !contextRef.current) return;
    const { x, y } = getScaledCoordinates(e);

    if (tool === 'pen' && currentStrokeRef.current) {
      currentStrokeRef.current.points.push({ x, y });
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    }

    if (tool === 'rulerLine' && rulerLineStart) {
      setRulerLineEnd({ x, y });
      renderCanvas(); // background wapas render karo
      const ctx = contextRef.current;
      const rotatedEnd = rotatePoint(x, y, rulerLineStart.x, rulerLineStart.y, rulerAngle);
      ctx.setTransform(scale, 0, 0, scale, panOffset.x, panOffset.y);
      ctx.beginPath();
      ctx.moveTo(rulerLineStart.x, rulerLineStart.y);
      ctx.lineTo(rotatedEnd.x, rotatedEnd.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }

    if (socket) {
      socket.emit('drawing', { room: sessionId, action: 'draw', x, y, tool, color, lineWidth });
    }
  }, [isDrawing, contextRef, getScaledCoordinates, tool, lineWidth, socket, sessionId, color, rulerLineStart, rulerAngle, scale, panOffset, renderCanvas]);

  const drawShapePreview = useCallback((e) => {
    // (kept for API compatibility — actual preview ab live draw se hoti hai)
  }, []);

  const finishDrawing = useCallback((e) => {
    if (!isDrawing && !isDrawingCircle && !isDraggingCompass) return;
    const { x, y } = getScaledCoordinates(e);

    if (isDraggingCompass) {
      setIsDraggingCompass(false);
      return;
    }

    if (tool === 'pen' && currentStrokeRef.current) {
      const finishedStroke = currentStrokeRef.current;
      currentStrokeRef.current = null;
      if (finishedStroke.points.length > 1) {
        setStrokes(prev => [...prev, finishedStroke]);
        setActionLog(prev => [...prev, { type: 'stroke', id: finishedStroke.id }]);
        setRedoActionStack([]);
      }
      setIsDrawing(false);
      return;
    }

    if (tool === 'eraser') {
      setIsDrawing(false);
      return;
    }

    if (isRulerDrawing && tool === 'rulerLine' && rulerLineStart && rulerLineEnd) {
      const dx = rulerLineEnd.x - rulerLineStart.x;
      const dy = rulerLineEnd.y - rulerLineStart.y;
      const lengthPx = Math.sqrt(dx * dx + dy * dy);
      const pxPerCm = 30;
      const lengthCm = (lengthPx / pxPerCm).toFixed(1);

      const newLine = {
        id: `ruler-${Date.now()}`,
        x1: rulerLineStart.x, y1: rulerLineStart.y,
        x2: rulerLineEnd.x, y2: rulerLineEnd.y,
        color, lineWidth,
        label: `${lengthCm} cm`,
      };
      setRulerLines(prev => [...prev, newLine]);
      setActionLog(prev => [...prev, { type: 'rulerLine', id: newLine.id }]);
      setRedoActionStack([]);

      setIsRulerDrawing(false);
      setRulerLineStart(null);
      setRulerLineEnd(null);
    }

    if (isDrawingCircle && tool === 'compass' && pivotPoint) {
      const dx = x - pivotPoint.x;
      const dy = y - pivotPoint.y;
      const radius = Math.hypot(dx, dy);
      const newCircle = { id: `circle-${Date.now()}`, x: pivotPoint.x, y: pivotPoint.y, r: radius, color, lineWidth };
      setCircles(prev => [...prev, newCircle]);
      setActionLog(prev => [...prev, { type: 'circle', id: newCircle.id }]);
      setRedoActionStack([]);
      setIsDrawingCircle(false);
    }

    setIsDrawing(false);

    if (socket) {
      socket.emit('drawing', { room: sessionId, action: 'finish' });
    }
  }, [
    isDrawing, isDrawingCircle, isDraggingCompass, getScaledCoordinates, contextRef,
    tool, pivotPoint, color, lineWidth, socket, sessionId,
    isRulerDrawing, rulerLineStart, rulerLineEnd, setIsDraggingCompass, setIsDrawingCircle
  ]);

  useEffect(() => {
    if (tool !== 'rulerLine') setRulerLineStart(null);
  }, [tool]);

  const handleMouseDown = useCallback((e) => {
    if (!contextRef.current) return;

    if (tool === 'rulerLine' && rulerLineStart) {
      const { x, y } = getScaledCoordinates(e);
      renderCanvas();
      const ctx = contextRef.current;
      const rotatedEnd = rotatePoint(x, y, rulerLineStart.x, rulerLineStart.y, rulerAngle);
      ctx.setTransform(scale, 0, 0, scale, panOffset.x, panOffset.y);
      ctx.beginPath();
      ctx.moveTo(rulerLineStart.x, rulerLineStart.y);
      ctx.lineTo(rotatedEnd.x, rotatedEnd.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    } else {
      startDrawing(e);
    }
  }, [tool, startDrawing, getScaledCoordinates, rulerLineStart, rulerAngle, lineWidth, color, contextRef, renderCanvas, scale, panOffset]);

  useEffect(() => {
    if (tool !== 'rulerLine' && (!tool || !tool.startsWith("3d-"))) {
      setRulerLineStart(null);
      setRulerLineEnd(null);
      setIsRulerDrawing(false);
    }
  }, [tool]);

  useEffect(() => {
    const handleMove = (e) => {
      if (threeD && threeD.isDrawing3D) {
        threeD.update3DShape(e);
        return;
      }
      if (!contextRef.current) return;
      const { x, y } = getScaledCoordinates(e);

      if (isDraggingCompass) {
        setCompassPosition({ x: x - dragStartOffset.x, y: y - dragStartOffset.y });
        return;
      }

      if (isRulerDrawing && tool === 'rulerLine' && rulerLineStart) {
        setRulerLineEnd({ x, y });
        renderCanvas();
        const ctx = contextRef.current;
        const rotatedEnd = rotatePoint(x, y, rulerLineStart.x, rulerLineStart.y, rulerAngle);
        ctx.setTransform(scale, 0, 0, scale, panOffset.x, panOffset.y);
        ctx.beginPath();
        ctx.moveTo(rulerLineStart.x, rulerLineStart.y);
        ctx.lineTo(rotatedEnd.x, rotatedEnd.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        return;
      }

      if (tool === 'eraser') {
        handleEraserMove(e);
        if (isDrawing) eraseAtPoint(x, y);
        renderCanvas();
        drawEraserPreview();
        return;
      }

      if (isDrawing && ['pen', 'line'].includes(tool)) {
        drawLine(e);
      }
    };

    const handleUp = (e) => {
      if (threeD && threeD.isDrawing3D) threeD.finish3DShape();

      if (isDraggingCompass) {
        setIsDraggingCompass(false);
        return;
      }

      if (isRulerDrawing && tool === 'rulerLine' && rulerLineStart && rulerLineEnd) {
        finishDrawing(e);
        if (threeD && typeof threeD.render3DShapes === 'function') threeD.render3DShapes();
        return;
      }

      if (
        (isDrawingCircle && tool === 'compass') ||
        (isDrawing && ['pen', 'eraser', 'line'].includes(tool))
      ) {
        finishDrawing(e);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [
    threeD, isDrawing, tool, drawLine, finishDrawing, contextRef,
    isDraggingCompass, dragStartOffset, setCompassPosition, getScaledCoordinates,
    setIsDraggingCompass, isDrawingCircle, rulerLineStart, rulerLineEnd, isRulerDrawing,
    rulerAngle, color, lineWidth, eraseAtPoint, handleEraserMove, renderCanvas,
    drawEraserPreview, scale, panOffset
  ]);

  return {
    tool, setTool,
    color, setColor,
    lineWidth, setLineWidth,
    isDrawing, setIsDrawing,
    stickyNotes, setStickyNotes,
    compassPosition, setCompassPosition,
    isDraggingCompass, setIsDraggingCompass,
    compassAngle,
    isDrawingCircle, setIsDrawingCircle,
    pivotPoint, setPivotPoint,
    currentPoint, setCurrentPoint,
    startDrawing, drawLine, finishDrawing, handleMouseDown,
    getScaledCoordinates,
    drawShapePreview,
    handleUpdateStickyNoteSize,
    protractorPosition, setProtractorPosition,
    isDraggingProtractor, setIsDraggingProtractor,
    protractorRadius, setProtractorRadius,
    handleProtractorDrag,
    finalizeAngle,
    drawCircleOnCanvas,
    rulerAngle, setRulerAngle,
    renderCanvas,
    // Naya persistent data (vector-based world content):
    strokes, setStrokes,
    circles, setCircles,
    rulerLines, setRulerLines,
    angles, setAngles,
    actionLog, setActionLog,
    redoActionStack, setRedoActionStack,
  };
};

export default useCanvasDrawing;