import { useState, useEffect, useCallback } from 'react';

const useCanvasDrawing = (
    canvasRef,
    contextRef,
    scale,
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
    rulerAngle,
    setRulerAngle
) => {
    const [tool, setTool] = useState('pen');
    
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);
    const [isDrawing, setIsDrawing] = useState(false);
    const [pivotPoint, setPivotPoint] = useState(null);
    const [currentPoint, setCurrentPoint] = useState(null);
    const [stickyNotes, setStickyNotes] = useState([]);
    const [rulerStart, setRulerStart] = useState(null);
    // lineStart state is removed
    const [isDrawingCircle, setIsDrawingCircle] = useState(false);
    const COMPASS_WIDTH = 100;
    const COMPASS_HEIGHT = 100;
    const [previousSnapshot, setPreviousSnapshot] = useState(null);
    const prevImg = new Image();
    const [protractorPosition, setProtractorPosition] = useState({ x: 200, y: 200 });
    const [isDraggingProtractor, setIsDraggingProtractor] = useState(false);
    const [protractorRadius, setProtractorRadius] = useState(120);
    const [angles, setAngles] = useState([]);
    const [circles, setCircles] = useState([]);
    const [rulerLineStart, setRulerLineStart] = useState(null);

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

        return (
            x >= compX &&
            x <= compX + COMPASS_WIDTH &&
            y >= compY &&
            y <= compY + COMPASS_HEIGHT
        );
    }, [compassPosition]);

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

        const x = (clientX - rect.left) / scale;
        const y = (clientY - rect.top) / scale;
        return { x, y };
    }, [canvasRef, scale]);

    const handleProtractorDrag = useCallback((x, y) => {
        setProtractorPosition({ x: x, y: y });
    }, [setProtractorPosition]);

    const finalizeAngle = useCallback((angleData) => {
        if (!angleData) return;
        const centerX = protractorPosition.x;
        const centerY = protractorPosition.y;
        const radius = protractorRadius;
        const startAngle = 0;
        const endAngle = (-angleData.angle * Math.PI) / 180;
        
        setAngles(prev => [...prev, { centerX, centerY, radius, startAngle, endAngle }]);
        
        const ctx = contextRef.current;
        if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            if (backgroundSnapshot) {
                const bgImg = new Image();
                bgImg.src = backgroundSnapshot;
                bgImg.onload = () => {
                    ctx.drawImage(bgImg, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    drawAngle(ctx, centerX, centerY, radius, startAngle, endAngle);
                };
            } else {
                drawAngle(ctx, centerX, centerY, radius, startAngle, endAngle);
            }
        }
    }, [protractorPosition, protractorRadius, setAngles, contextRef, backgroundSnapshot]);

    function drawAngle(ctx, centerX, centerY, radius, startAngle, endAngle) {
        const lineLengthMultiplier = 1.2;
        const arrowSize = 10;

        ctx.beginPath();
        const startLineX = centerX + (radius * lineLengthMultiplier) * Math.cos(startAngle);
        const startLineY = centerY + (radius * lineLengthMultiplier) * Math.sin(startAngle);
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(startLineX, startLineY);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
        drawArrowhead(ctx, startLineX, startLineY, startAngle, arrowSize);

        ctx.beginPath();
        const endLineX = centerX + (radius * lineLengthMultiplier) * Math.cos(endAngle);
        const endLineY = centerY + (radius * lineLengthMultiplier) * Math.sin(endAngle);
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endLineX, endLineY);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
        drawArrowhead(ctx, endLineX, endLineY, endAngle, arrowSize);

        let spanAngle = endAngle - startAngle;
        if (spanAngle < 0) {
            spanAngle += 2 * Math.PI;
        }
        const angleDeg = Math.round(spanAngle * 180 / Math.PI);

        const arcRadius = radius / 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, arcRadius, startAngle, endAngle, angleDeg > 180);
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;
        ctx.stroke();

        const displayedAngle = Math.abs(Math.round(endAngle * 180 / Math.PI));

        let midAngle = (startAngle + endAngle) / 2;
        if (displayedAngle > 180) {
            midAngle = (endAngle + Math.PI);
        }

        const labelX = centerX + (arcRadius + 15) * Math.cos(midAngle);
        const labelY = centerY + (arcRadius + 15) * Math.sin(midAngle);

        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(displayedAngle + "°", labelX, labelY);
    }

    function drawArrowhead(ctx, x, y, angle, size) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.moveTo(0, 0);
        ctx.lineTo(-size, -size / 2);
        ctx.lineTo(-size, size / 2);
        ctx.closePath();
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.restore();
    }

    const drawCircleOnCanvas = (x, y, radius, startAngle, endAngle) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const startRadians = (startAngle * Math.PI) / 180;
        const endRadians = (endAngle * Math.PI) / 180;
        ctx.beginPath();
        ctx.arc(x, y, radius, startRadians, endRadians);
        ctx.stroke();
    };

    // Removed drawLinePreview function
    const startDrawing = useCallback((e) => {
        if (!contextRef.current || tool === 'text') return;
        const { x, y } = getScaledCoordinates(e);

        if (tool === 'compass') {
            if (isInsideCompass(x, y)) {
                setIsDraggingCompass(true);
                setDragStartOffset({
                    x: x - compassPosition.x,
                    y: y - compassPosition.y,
                });
            }
            return;
        }

        // Removed logic for 'lined' tool
        // if (tool === 'lined') { ... }

        if (tool === 'pen' || tool === 'eraser') {
            contextRef.current.beginPath();
            contextRef.current.moveTo(x, y);
            setIsDrawing(true);
        } if (tool === 'rulerLine') {
            const { x, y } = getScaledCoordinates(e);
            setRulerLineStart({ x, y });
            setIsDrawing(true);
        
            // ✅ yahan snapshot save karna zaroori hai
            const snapshot = canvasRef.current.toDataURL();
            setPreviousSnapshot(snapshot);
        }
        
          else if (tool === 'stickyNote') {
            const newNote = {
                id: Date.now(),
                x,
                y,
                text: '',
                color: '#ffff00',
            };
            setStickyNotes(prevNotes => [...prevNotes, newNote]);
        }

        if (socket) {
            socket.emit('drawing', { room: sessionId, action: 'start', x, y, tool, color, lineWidth });
        }
    }, [contextRef, tool, getScaledCoordinates, socket, sessionId, color, lineWidth, compassPosition, isInsideCompass, setDragStartOffset, setIsDraggingCompass]);

    const drawLine = useCallback((e) => {
        if (!isDrawing || !contextRef.current) return;
        const { x, y } = getScaledCoordinates(e);

        if (tool === 'pen') {
            contextRef.current.lineTo(x, y);
            contextRef.current.stroke();
        } else if (tool === 'eraser') {
            contextRef.current.clearRect(x - lineWidth / 2, y - lineWidth / 2, lineWidth, lineWidth);
        }
        if (tool === 'rulerLine' && rulerLineStart && previousSnapshot) {
            const { x, y } = getScaledCoordinates(e);
            const ctx = contextRef.current;
            const img = new Image();
            img.src = previousSnapshot;
            img.onload = () => {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
                const angleRad = (rulerAngle * Math.PI) / 180;
                const dx = x - rulerLineStart.x;
                const dy = y - rulerLineStart.y;
                const length = dx * Math.cos(angleRad) + dy * Math.sin(angleRad);
        
                const endX = rulerLineStart.x + length * Math.cos(angleRad);
                const endY = rulerLineStart.y + length * Math.sin(angleRad);
        
                ctx.beginPath();
                ctx.moveTo(rulerLineStart.x, rulerLineStart.y);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            };
        }
        
          
        if (socket) {
            socket.emit('drawing', { room: sessionId, action: 'draw', x, y, tool, color, lineWidth });
        }
    }, [isDrawing, contextRef, getScaledCoordinates, tool, lineWidth, socket, sessionId, color]);

    const drawShapePreview = useCallback((e) => {
        if (!isDrawingCircle || !contextRef.current || !pivotPoint) return;
        // This function is no longer used for the compass tool
    }, [isDrawingCircle, contextRef, getScaledCoordinates, previousSnapshot, color, lineWidth, pivotPoint]);

    const finishDrawing = useCallback((e) => {
        if (!isDrawing && !isDrawingCircle && !isDraggingCompass) return;
        const { x, y } = getScaledCoordinates(e);
        const ctx = contextRef.current;

        if (isDraggingCompass) {
            setIsDraggingCompass(false);
            return;
        }

        // Removed logic for 'lined' tool
        // if (tool === 'lined' && lineStart) { ... }

        if (tool === 'pen' || tool === 'eraser') {
            ctx.closePath();
        }
        if (tool === 'rulerLine' && rulerLineStart) {
            const { x, y } = getScaledCoordinates(e);
            const ctx = contextRef.current;
            const angleRad = (rulerAngle * Math.PI) / 180;
        
            const dx = x - rulerLineStart.x;
            const dy = y - rulerLineStart.y;
            const length = dx * Math.cos(angleRad) + dy * Math.sin(angleRad);
        
            const endX = rulerLineStart.x + length * Math.cos(angleRad);
            const endY = rulerLineStart.y + length * Math.sin(angleRad);
        
            ctx.beginPath();
            ctx.moveTo(rulerLineStart.x, rulerLineStart.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        
            setRulerLineStart(null);
            setIsDrawing(false);
            setPreviousSnapshot(null); // ✅ reset
        
            const snapshot = canvasRef.current.toDataURL();
            setBackgroundSnapshot(snapshot);
        }
        
        if (isDrawingCircle && tool === 'compass' && pivotPoint) {
            const dx = x - pivotPoint.x;
            const dy = y - pivotPoint.y;
            const radius = Math.sqrt(dx * dx + dy * dy);
        
            setCircles(prev => [
                ...prev,
                { x: pivotPoint.x, y: pivotPoint.y, r: radius, color, lineWidth }
            ]);
        
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.arc(pivotPoint.x, pivotPoint.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
        
            setIsDrawingCircle(false);
        }
        const snapshot = canvasRef.current.toDataURL();
        setBackgroundSnapshot(snapshot);
        setIsDrawing(false);
        setPreviousSnapshot(null);

        if (socket) {
            socket.emit('drawing', { room: sessionId, action: 'finish', image: snapshot });
        }
    }, [isDrawing, isDrawingCircle, isDraggingCompass, contextRef, getScaledCoordinates, tool, pivotPoint, color, lineWidth, canvasRef, setBackgroundSnapshot, socket, sessionId]);

    const handleMouseDown = useCallback((e) => {
        if (!contextRef.current) return;
        startDrawing(e);
    }, [contextRef, startDrawing]);

    useEffect(() => {
        const handleMove = (e) => {
            if (!contextRef.current) return;
            const { x, y } = getScaledCoordinates(e);

            if (isDraggingCompass) {
                setCompassPosition({ x: x - dragStartOffset.x, y: y - dragStartOffset.y });
                return;
            }

            // Removed logic for 'lined' tool preview
            // if (tool === 'lined' && isDrawing && lineStart) { ... }

            if (isDrawing && ['pen', 'eraser', 'rulerLine'].includes(tool)) {
                drawLine(e);
            }
        };

        const handleUp = (e) => {
            if (isDraggingCompass) {
                setIsDraggingCompass(false);
                return;
            }

            if ((isDrawingCircle && tool === 'compass') || (isDrawing && ['pen', 'eraser', 'line'].includes(tool))) {
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
    }, [isDrawing, tool, drawLine, drawShapePreview, finishDrawing, contextRef, isDraggingCompass, dragStartOffset, setCompassPosition, getScaledCoordinates, setIsDraggingCompass, isDrawingCircle, pivotPoint, setCompassAngle]);

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
        circles, setCircles,
        rulerAngle, setRulerAngle
    };
};

export default useCanvasDrawing;