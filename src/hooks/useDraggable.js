// src/hooks/useDraggable.js

import { useState, useCallback, useEffect } from 'react';

/**
 * A custom hook to handle drag-and-drop functionality for shapes and a compass on a canvas.
 * @param {object} canvasRef - The ref to the canvas DOM element.
 * @param {Array} shapes - The array of shape objects to be dragged.
 * @param {Function} setShapes - The state setter for the shapes array.
 * @param {object} compassPosition - The current position of the compass.
 * @param {Function} setCompassPosition - The state setter for the compass position.
 * @param {Function} redrawCanvas - A function to redraw all elements on the canvas.
 * @param {number} scale - The current scale of the canvas.
 * @param {number} COMPASS_WIDTH - The width of the compass.
 * @param {number} COMPASS_HEIGHT - The height of the compass.
 * @returns {object} An object containing drag state and event handlers.
 */
const useDraggable = (canvasRef, shapes, setShapes, compassPosition, setCompassPosition, redrawCanvas, scale, COMPASS_WIDTH, COMPASS_HEIGHT) => {
    // State to manage the drag operation
    const [isDragging, setIsDragging] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null); // The item (shape or compass) being dragged
    const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });

    /**
     * Checks if a given point is inside a shape.
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     * @param {object} shape - The shape object.
     * @returns {boolean} True if the point is inside the shape, false otherwise.
     */
    const isPointInShape = useCallback((x, y, shape) => {
        if (!shape) return false;
        switch (shape.type) {
            case 'rectangle':
                const rectX = Math.min(shape.x, shape.x + shape.width);
                const rectY = Math.min(shape.y, shape.y + shape.height);
                const rectWidth = Math.abs(shape.width);
                const rectHeight = Math.abs(shape.height);
                return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
            case 'circle':
                const distance = Math.sqrt(Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2));
                return distance <= shape.radius;
            // Add other shape types here if needed
            default:
                return false;
        }
    }, []);

    /**
     * Checks if a given point is inside the compass.
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     * @returns {boolean} True if the point is inside the compass, false otherwise.
     */
    const isInsideCompass = useCallback((x, y) => {
        const compX = compassPosition.x;
        const compY = compassPosition.y;
        return (
            x >= compX &&
            x <= compX + COMPASS_WIDTH &&
            y >= compY &&
            y <= compY + COMPASS_HEIGHT
        );
    }, [compassPosition, COMPASS_WIDTH, COMPASS_HEIGHT]);

    /**
     * Finds the item (shape or compass) at the given coordinates.
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     * @returns {object|null} The dragged item or null if no item is found.
     */
    const findItemAtPoint = useCallback((x, y) => {
        // Check for compass first, as it's a special UI element
        if (isInsideCompass(x, y)) {
            return { type: 'compass' };
        }
        // Check for shapes in reverse order (to select the top-most shape)
        for (let i = shapes.length - 1; i >= 0; i--) {
            if (isPointInShape(x, y, shapes[i])) {
                return { type: 'shape', index: i };
            }
        }
        return null;
    }, [shapes, isPointInShape, isInsideCompass]);

    /**
     * Starts the dragging process on mouse down.
     * @param {number} x - The x-coordinate of the mouse down event.
     * @param {number} y - The y-coordinate of the mouse down event.
     */
    const startDrag = useCallback((x, y) => {
        const item = findItemAtPoint(x, y);
        if (item) {
            setIsDragging(true);
            setDraggedItem(item);
            if (item.type === 'compass') {
                setDragStartOffset({
                    x: x - compassPosition.x,
                    y: y - compassPosition.y,
                });
            } else if (item.type === 'shape') {
                const shape = shapes[item.index];
                setDragStartOffset({
                    x: x - shape.x,
                    y: y - shape.y,
                });
            }
        }
    }, [findItemAtPoint, shapes, compassPosition]);

    /**
     * Handles the movement of the dragged item.
     * @param {number} x - The x-coordinate of the mouse move event.
     * @param {number} y - The y-coordinate of the mouse move event.
     */
    const onDrag = useCallback((x, y) => {
        if (!isDragging || !draggedItem) return;

        const newX = x - dragStartOffset.x;
        const newY = y - dragStartOffset.y;

        if (draggedItem.type === 'compass') {
            setCompassPosition({ x: newX, y: newY });
        } else if (draggedItem.type === 'shape') {
            setShapes(prevShapes => {
                const updatedShapes = [...prevShapes];
                updatedShapes[draggedItem.index] = {
                    ...updatedShapes[draggedItem.index],
                    x: newX,
                    y: newY,
                };
                return updatedShapes;
            });
        }
    }, [isDragging, draggedItem, dragStartOffset, setCompassPosition, setShapes]);

    /**
     * Stops the dragging process on mouse up.
     */
    const stopDrag = useCallback(() => {
        setIsDragging(false);
        setDraggedItem(null);
        setDragStartOffset({ x: 0, y: 0 });
    }, []);

    // Effect to add event listeners for the drag functionality
    useEffect(() => {
        const handleMove = (e) => {
            if (!isDragging) return;
            // Handle touch and mouse events
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
            onDrag(x, y);
            // Redraw the canvas on every movement to show the item being dragged
            redrawCanvas();
        };

        const handleUp = () => {
            if (isDragging) {
                stopDrag();
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
    }, [isDragging, scale, onDrag, stopDrag, redrawCanvas, canvasRef]);

    return {
        isDragging,
        draggedItem,
        startDrag,
        stopDrag,
    };
};

export default useDraggable;
