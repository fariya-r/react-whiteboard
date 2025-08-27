import React, { useState, useRef, useEffect } from "react";

const Compass = ({
  size = 280,
  legLength = 140,
  legWidth = 10,
  initialSpreadDeg = 28,
  initialRotation = -15,
  onDrawCircle,
}) => {
  // Use state to manage the interactive properties of the compass
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [spreadDeg, setSpreadDeg] = useState(initialSpreadDeg);
  const [rotation, setRotation] = useState(initialRotation);
  const [interactionMode, setInteractionMode] = useState(null); // null, 'drag', 'spread', or 'rotate'
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [spreadOffset, setSpreadOffset] = useState(0);
  const [drawingStartAngle, setDrawingStartAngle] = useState(null);

  
  // Use a ref to get the SVG element's dimensions for accurate calculations
  const svgRef = useRef(null);

  // Common SVG properties
  const c = size / 2;
  const tipLen = 16;
  const tipHalf = 7;
  const backStickLen = 55;
  const extraPadding = 50; // extra padding to ensure tips are not cut off
  const svgWidth = size + extraPadding * 2;
  const svgHeight = size + extraPadding * 2;
  const svgCenter = svgWidth / 2;

  // Helper function to get coordinates from mouse or touch event
  const getCoords = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  // Handles the start of any interaction (drag or spread)
  const handleStart = (e, mode) => {
    e.stopPropagation();
    setInteractionMode(mode);
    const { x, y } = getCoords(e);
    if (mode === 'drag') {
      // Calculate offset for dragging the entire compass
      setDragOffset({ x: x - position.x, y: y - position.y });
    } else if (mode === 'spread') {
      // Calculate the initial angle for spreading the legs
      const rect = svgRef.current.getBoundingClientRect();
      const pivotX = position.x - rect.left;
      const pivotY = position.y - rect.top;
      const mouseX = x - rect.left;
      const mouseY = y - rect.top;
      const initialAngle = (Math.atan2(mouseY - pivotY, mouseX - pivotX) * 180) / Math.PI;
      const currentHalfSpread = -spreadDeg / 2;
      setSpreadOffset(initialAngle - currentHalfSpread);
    } else if (mode === 'rotate') {
      const rect = svgRef.current.getBoundingClientRect();
      const pivotX = position.x - rect.left;
      const pivotY = position.y - rect.top;
      const mouseX = x - rect.left;
      const mouseY = y - rect.top;
      const initialAngle = (Math.atan2(mouseY - pivotY, mouseX - pivotX) * 180) / Math.PI;
      setDragOffset({ x: initialAngle - rotation, y: 0 });
      
      // Set the initial angle when the drawing starts
      setDrawingStartAngle(initialAngle); 
    }
  };
  
  // Handles the mouse/touch movement for all interactions
  const handleMove = (e) => {
    if (interactionMode === 'drag') {
      const { x, y } = getCoords(e);
      setPosition({
        x: x - dragOffset.x,
        y: y - dragOffset.y,
      });
    } else if (interactionMode === 'spread') {
      const { x, y } = getCoords(e);
      const rect = svgRef.current.getBoundingClientRect();
      const pivotX = position.x - rect.left;
      const pivotY = position.y - rect.top;
      const mouseX = x - rect.left;
      const mouseY = y - rect.top;

      const newAngle = (Math.atan2(mouseY - pivotY, mouseX - pivotX) * 180) / Math.PI;
      const newHalfSpread = newAngle - spreadOffset;
      const newSpread = -newHalfSpread * 2;
      
      setSpreadDeg(Math.min(170, Math.max(0, newSpread)));
    } else if (interactionMode === 'rotate') {
      const { x, y } = getCoords(e);
      const rect = svgRef.current.getBoundingClientRect();
      const pivotX = position.x - rect.left;
      const pivotY = position.y - rect.top;
      const mouseX = x - rect.left;
      const mouseY = y - rect.top;
      const newAngle = (Math.atan2(mouseY - pivotY, mouseX - pivotX) * 180) / Math.PI;
      setRotation(newAngle - dragOffset.x);
  
      // Calculate radius and call the new arc drawing function
      const radius = 2 * legLength * Math.sin((spreadDeg * Math.PI) / 360);
      
      // Check if drawing has started
      if (onDrawCircle && drawingStartAngle !== null) {
        // We'll pass the start angle and the current angle to draw the arc
        onDrawCircle(position.x, position.y, radius, drawingStartAngle, newAngle);
      }
    }
  };

  // Handles the end of any interaction
  const handleEnd = () => {
    setInteractionMode(null);
    setDrawingStartAngle(null); // Reset the start angle when drawing stops
};
  
  // A single leg component (remains mostly the same, but extracted for clarity)
  const Leg = ({ fill = "#2f3b47", showPencil = false }) => (
    <g>
      {/* main bar */}
      <rect
        x={0}
        y={-legWidth / 2}
        width={legLength}
        height={legWidth}
        rx={legWidth / 2}
        fill={fill}
      />
      {/* end cap shading */}
      <rect
        x={legLength - 24}
        y={-legWidth / 2}
        width={24}
        height={legWidth}
        rx={legWidth / 2}
        fill="#374553"
        opacity="0.8"
      />
      {/* tip */}
      {showPencil ? (
        <>
          {/* pencil holder */}
          <rect
            x={legLength - 16}
            y={-legWidth / 2 - 2}
            width={16}
            height={legWidth + 4}
            rx={2}
            fill="#374553"
          />
          {/* blue pencil (proper shape) */}
          <g transform={`translate(${legLength - 20}, -5)`}>
            {/* pencil body */}
            <rect x="0" y="0" width="43" height="10" fill="#3b82f6" rx="2" />
            {/* pencil tip (wood) */}
            <polygon points="43,0 50,5 43,10" fill="#f59e0b" />
            {/* pencil lead */}

            <polygon points="50,5 47,5 50,6" fill="#222" />
            </g>
        </>
      ) : (
        /* needle tip */
        <polygon
          points={`
            ${legLength + tipLen},0
            ${legLength},${-3}
            ${legLength},${3}
          `}
          fill="#222"
        />
      )}
    </g>
  );

  return (
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{
          position: "absolute",
          left: `${position.x - svgCenter}px`,
          top: `${position.y - svgCenter}px`,
          cursor: interactionMode ? "grabbing" : "grab",
        }}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* Whole compass group (easy to rotate) */}
        <g id="compass-group" transform={`translate(${svgCenter} ${svgCenter}) rotate(${rotation})`}>
          {/* BACK small stick (behind) */}
          <g opacity="0.85">
            <rect
              x={-backStickLen}
              y={-4}
              width={backStickLen}
              height={8}
              rx={4}
              fill="#2b3642"
            />
          </g>

          {/* RIGHT front leg (needle) - NOW HAS SPREAD HANDLE */}
          <g transform={`rotate(${spreadDeg / 2})`}>
            <Leg showPencil={false} />
            {/* This handle is now invisible, allowing the user to drag to spread the legs */}
            <g
              id="needle-drag-handle"
              transform={`translate(${legLength} 0)`}
              onMouseDown={(e) => handleStart(e, 'spread')}
              onTouchStart={(e) => handleStart(e, 'spread')}
              style={{ cursor: interactionMode === 'spread' ? "grabbing" : "ew-resize" }}
            >
              <circle r="12" fill="transparent" stroke="transparent" />
            </g>
          </g>

          {/* LEFT front leg (pencil) - NOW HAS ROTATE HANDLE */}
          <g transform={`rotate(${-spreadDeg / 2})`}>
            <Leg showPencil />
            {/* Pencil handle is now for rotation */}
            <g
              id="pencil-rotate-handle"
              transform={`translate(${legLength} 0)`}
              onMouseDown={(e) => handleStart(e, 'rotate')}
              onTouchStart={(e) => handleStart(e, 'rotate')}
              style={{ cursor: interactionMode === 'rotate' ? "grabbing" : "pointer" }}
            >
              <circle r="12" fill="#2f3b47" stroke="#fff" strokeWidth="2" />
              <path d="M -4 -4 L 4 -4 L 0 -8 Z M -4 4 L 4 4 L 0 8 Z" fill="#fff" />
            </g>
          </g>

          {/* Pivot / rotation handle (smaller now) - NOW FOR DRAGGING */}
          <g
            id="compass-pivot"
            onMouseDown={(e) => handleStart(e, 'drag')}
            onTouchStart={(e) => handleStart(e, 'drag')}
            style={{ cursor: "grab" }}
          >
            <circle r="26" fill="#2f3b47" />
            <circle r="26" fill="url(#knobShadow)" opacity="0.35" />
            <circle r="26" fill="none" stroke="white" strokeWidth="1.8" opacity="0.35" />
            <circle r="20" fill="#2f3b47" stroke="white" strokeWidth="1.8" />
            
            {/* Two new circles added below */}
            <circle r="15" fill="#3b4856" stroke="white" strokeWidth="1" opacity="0.8" />
            <circle r="10" fill="#4d5c6f" stroke="white" strokeWidth="0.8" opacity="0.7" />

          </g>
        </g>

        {/* subtle defs */}
        <defs>
          <radialGradient id="knobShadow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
          </radialGradient>
        </defs>
      </svg>
  );
};

export default Compass;
