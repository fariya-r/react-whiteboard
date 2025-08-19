// src/hooks/useShapes.js
import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const useShapes = (canvasRef, scale, tool, color, lineWidth) => {
    const [shapes, setShapes] = useState([]);
    const [selectedShapeId, setSelectedShapeId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const resizeHandle = useRef(null);

    const getScaledCoordinates = useCallback((e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = (clientX - rect.left) / scale;
        const y = (clientY - rect.top) / scale;
        return { x, y };
    }, [canvasRef, scale]);

    const getShapeAtCoords = useCallback((x, y) => {
        for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            if (shape.type === 'rectangle' && x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
                return { ...shape, index: i };
            }
            // Add more shape types here (circle, line, etc.)
        }
        return null;
    }, [shapes]);

    const startShapeDrawing = useCallback((e) => {
        if (!['rectangle', 'circle', 'line', 'arrow'].includes(tool)) return;

        const { x, y } = getScaledCoordinates(e);
        const newShape = {
            id: uuidv4(),
            type: tool,
            x: x,
            y: y,
            x2: x,
            y2: y,
            width: 0,
            height: 0,
            color,
            lineWidth,
        };
        setShapes(prev => [...prev, newShape]);
        setSelectedShapeId(newShape.id);
        dragStart.current = { x, y };
        setIsDragging(true); // Isse hum samajh jayenge ki naya shape ban raha hai
    }, [tool, color, lineWidth, getScaledCoordinates]);

    const handleShapeMove = useCallback((e) => {
        if (!isDragging || !selectedShapeId) return;

        const { x, y } = getScaledCoordinates(e);
        const lastShape = shapes[shapes.length - 1];

        if (lastShape && lastShape.id === selectedShapeId) {
            // Naya shape ban raha hai, uski size update karein
            const newShapes = [...shapes];
            newShapes[newShapes.length - 1] = {
                ...lastShape,
                width: x - lastShape.x,
                height: y - lastShape.y,
                x2: x,
                y2: y
            };
            setShapes(newShapes);
        } else {
            // Existing shape ko drag ya resize kar rahe hain
            const dx = x - dragStart.current.x;
            const dy = y - dragStart.current.y;
            
            setShapes(prevShapes => prevShapes.map(shape => {
                if (shape.id === selectedShapeId) {
                    return {
                        ...shape,
                        x: shape.x + dx,
                        y: shape.y + dy,
                    };
                }
                return shape;
            }));
            dragStart.current = { x, y };
        }
    }, [isDragging, selectedShapeId, shapes, getScaledCoordinates]);

    const finishShapeDrawing = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
        // Is stage par, aap shape ko socket ke through emit kar sakte hain.
    }, []);

    const handleShapeMouseDown = useCallback((e) => {
        const { x, y } = getScaledCoordinates(e);
        const shape = getShapeAtCoords(x, y);

        if (shape) {
            setSelectedShapeId(shape.id);
            dragStart.current = { x, y };
            setIsDragging(true);
        } else {
            setSelectedShapeId(null);
            startShapeDrawing(e);
        }
    }, [getScaledCoordinates, getShapeAtCoords, startShapeDrawing]);

    return {
        shapes,
        setShapes,
        selectedShapeId,
        setSelectedShapeId,
        handleShapeMouseDown,
        handleShapeMove,
        finishShapeDrawing,
        isDragging,
    };
};

export default useShapes;