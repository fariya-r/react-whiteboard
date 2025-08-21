// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { Rnd } from "react-rnd";
// const SHAPE_TYPES = ["rectangle", "circle", "line", "arrow"];

// export default function ShapeLayer({
//   active,
//   tool,
//   color = "#000",
//   lineWidth = 2,
//   scale = 1,
//   width = 1200,
//   height = 800,
//   initialShapes = [],
//   onShapesChange,
//   scrollX, // 👈 Receive scrollX prop
//   scrollY, // 👈 Receive scrollY prop
// }) {
//   const layerRef = useRef(null);
//   const [shapes, setShapes] = useState(() => initialShapes);
//   const [selectedId, setSelectedId] = useState(null);
//   const creatingRef = useRef(null);
//   const [activeShape, setActiveShape] = useState(null);
//   const [isDragging, setIsDragging] = useState(false);
  
//   useEffect(() => {
//     if (!onShapesChange) return;
//     const timeout = setTimeout(() => {
//       onShapesChange(shapes);
//     }, 300); // 300ms ke baad save hoga
  
//     return () => clearTimeout(timeout);
//   }, [shapes, onShapesChange]);
  
//   useEffect(() => {
//     setShapes(initialShapes);
//   }, [initialShapes]);
  
//   useEffect(() => {
//     const onKey = (e) => {
//       if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
//         setShapes((prev) => prev.filter((s) => s.id !== selectedId));
//         setSelectedId(null);
//       }
//       if (e.key === "Escape") {
//         setSelectedId(null);
//         creatingRef.current = null;
//       }
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [selectedId]);


//   const onMouseDown = useCallback(
//     (e) => {
//       if (!active) return;
//       if (!SHAPE_TYPES.includes(tool)) return;
  
//       const rect = layerRef.current.getBoundingClientRect();
//       const x = (e.clientX - rect.left + scrollX) / scale;
//       const y = (e.clientY - rect.top + scrollY) / scale;
  
//       const hitShape = shapes.find((shape) => isPointInShape(x, y, shape));
  
//       if (hitShape) {
//         // 👉 Drag/resize mode
//         setActiveShape(hitShape.id);
//         setIsDragging(true);
//         return;
//       }
  
//       // 👉 Create new shape
//       const id = Date.now().toString();
//       creatingRef.current = { id, type: tool, startX: x, startY: y };
  
//       setShapes((prev) => [
//         ...prev,
//         {
//           id,
//           type: tool,
//           x,
//           y,
//           width: 2,
//           height: 2,
//           stroke: color,
//           strokeWidth: lineWidth,
//         },
//       ]);
//       setSelectedId(id);
//     },
//     [active, tool, color, lineWidth, scale, scrollX, scrollY, shapes]
//   );

//   function isPointInShape(x, y, shape) {
//     return (
//       x >= shape.x &&
//       x <= shape.x + shape.width &&
//       y >= shape.y &&
//       y <= shape.y + shape.height
//     );
//   }
  

//   const onMouseMove = useCallback(
//     (e) => {
//       if (!creatingRef.current) return;
//       const { id, startX, startY } = creatingRef.current;
//       const rect = layerRef.current.getBoundingClientRect();

//       // Use the props instead of a DOM lookup
//       const currX = (e.clientX - rect.left + scrollX) / scale;
//       const currY = (e.clientY - rect.top + scrollY) / scale;

//       const x = Math.min(startX, currX);
//       const y = Math.min(startY, currY);
//       const widthC = Math.max(2, Math.abs(currX - startX));
//       const heightC = Math.max(2, Math.abs(currY - startY));

//       setShapes((prev) =>
//         prev.map((s) =>
//           s.id === id
//             ? {
//                 ...s,
//                 x,
//                 y,
//                 width: widthC,
//                 height: heightC,
//               }
//             : s
//         )
//       );
//     },
//     [scale, scrollX, scrollY] // 👈 Add dependencies
//   );

//   const onMouseUp = useCallback(() => {
//     creatingRef.current = null;
//   }, []);

//   const pointerEvents = active ? "auto" : "none";

//   return (
//     <div
//       ref={layerRef}
//       onMouseDown={onMouseDown}
//       onMouseMove={onMouseMove}
//       onMouseUp={onMouseUp}
//       style={{
//         position: "fixed",   // 👈 pura screen cover kare
//         left: 0,
//         top: 0,
//         width: "100vw",      // 👈 full screen
//         height: "100vh",     // 👈 full screen
//         zIndex: 5,
//         pointerEvents: pointerEvents,
//       }}
//     >
//       {shapes.map((shape) => (
//         <ShapeBox
//           key={shape.id}
//           shape={shape}
//           scale={scale}
//           isSelected={shape.id === selectedId}
//           onSelect={() => setSelectedId(shape.id)}
//           onChange={(next) =>
//             setShapes((prev) => prev.map((s) => (s.id === next.id ? next : s)))
//           }
//         />
//       ))}
//     </div>
//   );
  
// }

// function ShapeBox({ shape, onChange, onSelect, isSelected, scale }) {
//   const { id, type, x, y, width, height, stroke = "#000", strokeWidth = 2, rotation = 0 } = shape;
//   const boxRef = useRef(null);

//   const handleRotateStart = (e) => {
//     e.stopPropagation();

//     const rect = boxRef.current.getBoundingClientRect();
//     const center = {
//       x: rect.left + rect.width / 2,
//       y: rect.top + rect.height / 2,
//     };

//     const startAngle =
//       (Math.atan2(e.clientY - center.y, e.clientX - center.x) * 180) / Math.PI;

//     const startRotation = rotation;

//     const onMouseMove = (moveEvent) => {
//       const currentAngle =
//         (Math.atan2(
//           moveEvent.clientY - center.y,
//           moveEvent.clientX - center.x
//         ) *
//           180) /
//         Math.PI;

//       const newRotation = startRotation + (currentAngle - startAngle);
//       onChange({ ...shape, rotation: newRotation });
//     };

//     const onMouseUp = () => {
//       document.removeEventListener("mousemove", onMouseMove);
//       document.removeEventListener("mouseup", onMouseUp);
//     };

//     document.addEventListener("mousemove", onMouseMove);
//     document.addEventListener("mouseup", onMouseUp);
//   };

//   return (
//     <Rnd
//       bounds={false}
//       scale={scale}
//       size={{ width, height }}
//       position={{ x, y }}
//       onDragStart={onSelect}
//       onResizeStart={onSelect}
//       onDragStop={(e, d) => onChange({ ...shape, x: d.x, y: d.y })}
//       onResizeStop={(e, direction, ref, delta, position) => {
//         const w = parseFloat(ref.style.width);
//         const h = parseFloat(ref.style.height);
//         onChange({
//           ...shape,
//           width: w,
//           height: h,
//           x: position.x,
//           y: position.y,
//         });
//       }}
//       enableResizing={{
//         top: true,
//         right: true,
//         bottom: true,
//         left: true,
//         topRight: true,
//         bottomRight: true,
//         bottomLeft: true,
//         topLeft: true,
//       }}
//       style={{
//         border: isSelected ? "1.5px dashed #4c9fff" : "1px solid transparent",
//         background: "transparent",
//         boxSizing: "border-box",
//       }}
//     >
//       <div
//         ref={boxRef}
//         style={{
//           width: "100%",
//           height: "100%",
//           position: "relative",
//           transform: `rotate(${rotation}deg)`,
//           transformOrigin: "center center",
//         }}
//       >
//         {/* Shape Content */}
//         <ShapeContent
//           type={type}
//           width={width}
//           height={height}
//           stroke={stroke}
//           strokeWidth={strokeWidth}
//           id={id}
//         />

//         {/* Rotation handle */}
//         {isSelected && (
//           <div
//             onMouseDown={handleRotateStart}
//             style={{
//               position: "absolute",
//               top: -25,
//               left: "50%",
//               transform: "translateX(-50%)",
//               width: 15,
//               height: 15,
//               borderRadius: "50%",
//               background: "#4c9fff",
//               cursor: "grab",
//             }}
//           />
//         )}
//       </div>
//     </Rnd>
//   );
// }

// function ShapeContent({ type, width, height, stroke, strokeWidth, id }) {
//   if (type === "rectangle") {
//     return (
//       <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
//         <rect x={0} y={0} width={width} height={height} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
//       </svg>
//     );
//   }

//   if (type === "circle") {
//     const rX = width / 2;
//     const rY = height / 2;
//     return (
//       <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
//         <ellipse cx={rX} cy={rY} rx={rX} ry={rY} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
//       </svg>
//     );
//   }

//   if (type === "line") {
//     return (
//       <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
//         <line x1={0} y1={0} x2={width} y2={height} stroke={stroke} strokeWidth={strokeWidth} />
//       </svg>
//     );
//   }

//   if (type === "arrow") {
//     const markerId = `arrow-${id}`;
//     return (
//       <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
//         <defs>
//           <marker id={markerId} markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
//             <path d="M0,0 L10,5 L0,10 z" fill={stroke} />
//           </marker>
//         </defs>
//         <line x1={0} y1={0} x2={width} y2={height} stroke={stroke} strokeWidth={strokeWidth} markerEnd={`url(#${markerId})`} />
//       </svg>
//     );
//   }

//   return null;
// }