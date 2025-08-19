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
    setCompassAngle
) => {
    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);
    const [isDrawing, setIsDrawing] = useState(false);
    const [pivotPoint, setPivotPoint] = useState(null);
    const [currentPoint, setCurrentPoint] = useState(null);
    const [stickyNotes, setStickyNotes] = useState([]);
    const [rulerStart, setRulerStart] = useState(null);
    const [lineStart, setLineStart] = useState(null);
    const [isDrawingCircle, setIsDrawingCircle] = useState(false);
    const COMPASS_WIDTH = 100;
    const COMPASS_HEIGHT = 100;
    const [previousSnapshot, setPreviousSnapshot] = useState(null);
    const prevImg = new Image();

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

    const drawRulerPreview = useCallback((e) => {
        if (!isDrawing || !rulerStart || !contextRef.current) return;
        const ctx = contextRef.current;
        const { x, y } = getScaledCoordinates(e);
    
        const draw = () => {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            if (previousSnapshot) {
                prevImg.onload = () => {};
                prevImg.src = previousSnapshot;
                ctx.drawImage(prevImg, 0, 0, canvasRef.current.width, canvasRef.current.height);
            }
    
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(rulerStart.x, rulerStart.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.closePath();
        }
    
        draw();
    }, [isDrawing, rulerStart, contextRef, getScaledCoordinates, previousSnapshot, color, lineWidth]);
    
    const drawLinePreview = useCallback((e) => {
        if (!isDrawing || !lineStart || !contextRef.current) return;
        const ctx = contextRef.current;
        const { x, y } = getScaledCoordinates(e);
    
        // Restore previous snapshot
        const img = new Image();
        img.src = previousSnapshot;
        img.onload = () => {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
            // Draw the line preview
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(lineStart.x, lineStart.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.closePath();
        };
    }, [isDrawing, lineStart, contextRef, getScaledCoordinates, previousSnapshot, color, lineWidth]);
    

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
            } else {
                setIsDrawingCircle(true);
                setPivotPoint({ x, y });
                setPreviousSnapshot(canvasRef.current.toDataURL());
            }
            return;
        }
        if (tool === 'lined') {
            setLineStart({ x, y });
            setIsDrawing(true);
            setPreviousSnapshot(canvasRef.current.toDataURL()); // for preview
            return;
        }
        
        
        if (tool === 'pen' || tool === 'eraser') {
            contextRef.current.beginPath();
            contextRef.current.moveTo(x, y);
            setIsDrawing(true);
        } else if (tool === 'stickyNote') {
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

        if (socket) {
            socket.emit('drawing', { room: sessionId, action: 'draw', x, y, tool, color, lineWidth });
        }
    }, [isDrawing, contextRef, getScaledCoordinates, tool, lineWidth, socket, sessionId, color]);

    const drawShapePreview = useCallback((e) => {
        if (!isDrawingCircle || !contextRef.current || !pivotPoint) return;
        const ctx = contextRef.current;
        const { x, y } = getScaledCoordinates(e);
    
        const draw = () => {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(prevImg, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            const dx = x - pivotPoint.x;
            const dy = y - pivotPoint.y;
            const radius = Math.sqrt(dx * dx + dy * dy);
            ctx.arc(pivotPoint.x, pivotPoint.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
        }
    
        if (previousSnapshot) {
            prevImg.onload = draw;
            prevImg.src = previousSnapshot;
        } else {
            draw();
        }
    }, [isDrawingCircle, contextRef, getScaledCoordinates, previousSnapshot, color, lineWidth, pivotPoint]);
    
    const finishDrawing = useCallback((e) => {
        if (!isDrawing && !isDrawingCircle && !isDraggingCompass) return;
        const { x, y } = getScaledCoordinates(e);
        const ctx = contextRef.current;
        
        if (isDraggingCompass) {
            setIsDraggingCompass(false);
            return;
        }

        if (tool === 'lined' && lineStart) {
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(lineStart.x, lineStart.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.closePath();
        
            setLineStart(null);
            setIsDrawing(false);
        
            const snapshot = canvasRef.current.toDataURL();
            setBackgroundSnapshot(snapshot);
            if (socket) {
                socket.emit('drawing', { room: sessionId, action: 'finish', image: snapshot });
            }
            return;
        }
        

        if (tool === 'compass' && isDrawingCircle && pivotPoint) {
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            const dx = x - pivotPoint.x;
            const dy = y - pivotPoint.y;
            const radius = Math.sqrt(dx * dx + dy * dy);
            ctx.arc(pivotPoint.x, pivotPoint.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
            setIsDrawingCircle(false);
            setPivotPoint(null);
            setCurrentPoint(null);
            const snapshot = canvasRef.current.toDataURL();
            setBackgroundSnapshot(snapshot);
            if (socket) {
                socket.emit('drawing', { room: sessionId, action: 'finish', image: snapshot });
            }
            return;
        }

        if (tool === 'pen' || tool === 'eraser') {
            ctx.closePath();
        }

        setIsDrawing(false);
        setPreviousSnapshot(null);

        const snapshot = canvasRef.current.toDataURL();
        setBackgroundSnapshot(snapshot);

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
        // Move compass
        setCompassPosition({ x: x - dragStartOffset.x, y: y - dragStartOffset.y });
        return;
    }

    if (tool === 'lined' && isDrawing && lineStart) {
        drawLinePreview(e);
        return;
    }
    

    if (isDrawingCircle && pivotPoint && tool === 'compass') {
        setCurrentPoint({ x, y });
        const dx = x - pivotPoint.x;
        const dy = y - pivotPoint.y;
        const angle = Math.atan2(dy, dx);
        setCompassAngle(angle + Math.PI / 2);
        drawShapePreview(e);
        return;
    }

    if (isDrawing && ['pen', 'eraser'].includes(tool)) {
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
            if (isDrawingCircle && tool === 'compass') {
                finishDrawing(e);
            } else if (isDrawing && ['pen', 'eraser'].includes(tool)) {
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
        handleUpdateStickyNoteSize
    };
};

export default useCanvasDrawing;
