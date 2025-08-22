// import { useState, useCallback, useRef } from 'react';
// import { v4 as uuidv4 } from 'uuid';

// const useShapesDrawing = (canvasRef, contextRef, tool, color, lineWidth, shapes, setShapes, scale) => {
//     const [isDrawingShape, setIsDrawingShape] = useState(false);
//     const [currentShape, setCurrentShape] = useState(null);
//     const [selectedShapeId, setSelectedShapeId] = useState(null);
//     const [isResizing, setIsResizing] = useState(false);
//     const [isDragging, setIsDragging] = useState(false);
//     const dragStart = useRef({ x: 0, y: 0 });
//     const resizeHandle = useRef(null);

//     const getScaledCoordinates = (e) => {
//         const rect = canvasRef.current.getBoundingClientRect();
//         const clientX = e.clientX || e.touches[0].clientX;
//         const clientY = e.clientY || e.touches[0].clientY;
//         const x = (clientX - rect.left) / scale;
//         const y = (clientY - rect.top) / scale;
//         return { x, y };
//     };

//     const drawShapeOnCanvas = useCallback(() => {
//         const ctx = contextRef.current;
//         ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
//         // Re-draw all existing shapes
//         shapes.forEach(shape => {
//             ctx.beginPath();
//             ctx.strokeStyle = shape.color;
//             ctx.lineWidth = shape.lineWidth;
            
//             if (shape.type === 'line' || shape.type === 'arrow') {
//                 ctx.moveTo(shape.x, shape.y);
//                 ctx.lineTo(shape.x2, shape.y2);
//             } else if (shape.type === 'rectangle' || shape.type === 'square') {
//                 ctx.rect(shape.x, shape.y, shape.width, shape.height);
//             } else if (shape.type === 'circle') {
//                 const radius = Math.sqrt(Math.pow(shape.x2 - shape.x, 2) + Math.pow(shape.y2 - shape.y, 2));
//                 ctx.arc(shape.x, shape.y, radius, 0, 2 * Math.PI);
//             }
            
//             ctx.stroke();
//         });

//         // Draw the current shape being drawn
//         if (currentShape) {
//             ctx.beginPath();
//             ctx.strokeStyle = currentShape.color;
//             ctx.lineWidth = currentShape.lineWidth;

//             if (currentShape.type === 'line' || currentShape.type === 'arrow') {
//                 ctx.moveTo((lineStart.x - offset.x) * scale, (lineStart.y - offset.y) * scale);
// ctx.lineTo((x - offset.x) * scale, (y - offset.y) * scale);

//             } else if (currentShape.type === 'rectangle' || currentShape.type === 'square') {
//                 ctx.rect(currentShape.x, currentShape.y, currentShape.width, currentShape.height);
//             } else if (currentShape.type === 'circle') {
//                 const radius = Math.sqrt(Math.pow(currentShape.x2 - currentShape.x, 2) + Math.pow(currentShape.y2 - currentShape.y, 2));
//                 ctx.arc(currentShape.x, currentShape.y, radius, 0, 2 * Math.PI);
//             }
            
//             ctx.stroke();
//         }
//     }, [shapes, currentShape]);

//     const startDrawingShape = useCallback((e) => {
//         if (!['rectangle', 'circle', 'line', 'arrow'].includes(tool)) return;

//         const { x, y } = getScaledCoordinates(e);
//         setIsDrawingShape(true);
//         setCurrentShape({
//             id: uuidv4(),
//             type: tool,
//             x,
//             y,
//             x2: x,
//             y2: y,
//             color,
//             lineWidth,
//         });
//     }, [tool, color, lineWidth]);

//     const drawShape = useCallback((e) => {
//         if (!isDrawingShape) return;
//         const { x, y } = getScaledCoordinates(e);
//         setCurrentShape(prev => ({
//             ...prev,
//             x2: x,
//             y2: y,
//         }));
//     }, [isDrawingShape]);

//     const finishDrawingShape = useCallback(() => {
//         if (!isDrawingShape) return;
//         setIsDrawingShape(false);
//         setShapes(prev => [...prev, currentShape]);
//         setCurrentShape(null);
//     }, [isDrawingShape, currentShape, setShapes]);

//     useEffect(() => {
//         drawShapeOnCanvas();
//     }, [drawShapeOnCanvas]);

//     return {
//         startDrawingShape,
//         drawShape,
//         finishDrawingShape,
//         shapes,
//         setShapes,
//     };
// };

// export default useShapesDrawing;