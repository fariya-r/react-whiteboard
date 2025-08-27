import React, { useCallback, useState } from "react";

// Assuming Tailwind CSS is available. The styling uses Tailwind classes.
const Protractor = ({
  radius = 250,
  handlePos,
  setHandlePos,
  angle,
  setAngle,
  onDrawAngle,
  drawnAngles,
}) => {
  // State to toggle between half and full protractor view
  const [isHalfMode, setIsHalfMode] = useState(true);

  // State for dragging the whole protractor
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDraggingTool, setIsDraggingTool] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // State to manage the active/highlighted state of the first layer
  const [isFirstLayerActive, setIsFirstLayerActive] = useState(false);
  // State to manage the active/highlighted state of the second layer (for scaling)
  const [isSecondLayerActive, setIsSecondLayerActive] = useState(false);
  // State to manage the active/highlighted state of the third layer (for rotation)
  const [isThirdLayerActive, setIsThirdLayerActive] = useState(false);

  // State for scaling the protractor, now controlled by drag
  const [scale, setScale] = useState(1);
  const [isDraggingSecondLayer, setIsDraggingSecondLayer] = useState(false);

  // New state for rotation, controlled by the third layer
  const [rotation, setRotation] = useState(0);
  const [isDraggingThirdLayer, setIsDraggingThirdLayer] = useState(false);
  const [startDragAngle, setStartDragAngle] = useState(0);

  // Center of the SVG canvas, plus a margin
  const center = { x: radius + 20, y: radius + 20 };
  
  // Radius for the new third layer boundary (adjusted based on the larger second layer)
  const thirdLayerRadius = radius * 0.6;

  // ======================
  // ANGLE HANDLE DRAGGING
  // ======================
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);

  
  const handleStartDrag = useCallback((e) => {
    e.preventDefault();
    setIsDraggingHandle(true);
    // Set third layer active and others inactive
    setIsThirdLayerActive(true);
    setIsFirstLayerActive(false);
    setIsSecondLayerActive(false);
  }, []);

  const handleEndDrag = useCallback(() => {
    setIsDraggingHandle(false);
    setIsDraggingTool(false);
    setIsDraggingSecondLayer(false);
    setIsDraggingThirdLayer(false);
    setScale(1); // Reset scale on drag end
    setIsThirdLayerActive(false); // Reset third layer active state
  }, []);

  const handleDrag = useCallback(
    (e) => {
      if (!isDraggingHandle) return;

      const isTouchEvent = e.touches && e.touches.length > 0;
      const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
      const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

      const svg = e.currentTarget.getBoundingClientRect();
      const x = clientX - svg.left - center.x;
      const y = clientY - svg.top - center.y;

      const dist = Math.sqrt(x * x + y * y);
      const newX = (x / dist) * radius;
      const newY = (y / dist) * radius;

      setHandlePos({ x: newX, y: newY });

      // Calculate the standard trigonometric angle (counter-clockwise from 0)
      let rawAngle = (Math.atan2(newY, newX) * 180) / Math.PI;
      
      // Convert to a 0-360 range
      if (rawAngle < 0) {
        rawAngle += 360;
      }
      
      // Apply the inner scale logic: 360 - outer_angle
      let innerAngle = 360 - Math.round(rawAngle);

      // Handle the case where the angle is 360, it should display as 0
      if (innerAngle === 360) {
        innerAngle = 0;
      }
      
      setAngle(innerAngle);

      if (isTouchEvent) e.preventDefault();
    },
    [isDraggingHandle, center, radius, setHandlePos, setAngle]
  );

  // ======================
  // PROTRACTOR DRAGGING
  // ======================
  const startToolDrag = (e) => {
    e.preventDefault();
    const isTouch = e.touches && e.touches.length > 0;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    setIsDraggingTool(true);
    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  };

  const onToolDrag = (e) => {
    if (!isDraggingTool) return;
    const isTouch = e.touches && e.touches.length > 0;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    setPosition({
      x: clientX - dragOffset.x,
      y: clientY - dragOffset.y,
    });
  };

  // ======================
  // SAVE ANGLE
  // ======================
  const triggerDrawAngle = () => {
    if (onDrawAngle) {
      // ✅ sirf angle bhejna hai
      onDrawAngle({ angle });
    }
  };
  
  
  // ======================
  // SECOND LAYER (SCALING) LOGIC
  // ======================
  const handleSecondLayerDragStart = (e) => {
    e.preventDefault();
    setIsDraggingSecondLayer(true);
    const isTouch = e.touches && e.touches.length > 0;
    // Set a reference point for scaling calculations
    setDragOffset({
      x: isTouch ? e.touches[0].clientX : e.clientX,
      y: isTouch ? e.touches[0].clientY : e.clientY,
    });
    
    // Deactivate other layers
    setIsFirstLayerActive(false);
    setIsSecondLayerActive(true); // This layer is active by dragging
    setIsThirdLayerActive(false);
  };

  const handleSecondLayerDragMove = (e) => {
    if (!isDraggingSecondLayer) return;
    const isTouch = e.touches && e.touches.length > 0;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    // Calculate the total distance moved from the start of the drag
    const dx = clientX - dragOffset.x;
    const dy = clientY - dragOffset.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Dynamically calculate the scale based on the drag distance.
    // Adjust the multiplier (0.01) to control sensitivity.
    const newScale = 1 + dragDistance * 0.01;
    // Cap the scale to prevent it from getting too big or small
    setScale(Math.min(Math.max(newScale, 0.5), 2.5));
  };
  
  const handleSecondLayerDragEnd = () => {
    setIsDraggingSecondLayer(false);
  };

  // ======================
  // THIRD LAYER (ROTATION) LOGIC
  // ======================
  const handleThirdLayerDragStart = (e) => {
    e.preventDefault();
    setIsDraggingThirdLayer(true);
    const isTouch = e.touches && e.touches.length > 0;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    // Calculate the initial angle of the mouse relative to the center
    const x = clientX - position.x - center.x;
    const y = clientY - position.y - center.y;
    const initialAngle = Math.atan2(y, x) * 180 / Math.PI;
    setStartDragAngle(initialAngle - rotation);
  };

  const handleThirdLayerDragMove = (e) => {
    if (!isDraggingThirdLayer) return;
    const isTouch = e.touches && e.touches.length > 0;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    
    // Calculate the current angle of the mouse relative to the center
    const x = clientX - position.x - center.x;
    const y = clientY - position.y - center.y;
    const currentAngle = Math.atan2(y, x) * 180 / Math.PI;

    // Set the new rotation
    setRotation(currentAngle - startDragAngle);
  };

  const handleThirdLayerDragEnd = () => {
    setIsDraggingThirdLayer(false);
  };
  
  // ======================
  // OUTER TICKS + LABELS (0-360 increasing clockwise)
  // ======================
  const getOuterTicksAndLabels = () => {
    const elements = [];
    const outerRadius = radius;
    const labelRadius = outerRadius - 25;
    const tickLength = 6;
    const majorTickLength = 12;

    for (let i = 0; i <= 360; i += 2) {
      const angleRad = (i * Math.PI) / 180;
      const isMajor = i % 10 === 0;
      const currentTickLength = isMajor ? majorTickLength : tickLength;
      
      const x1 = center.x + outerRadius * Math.cos(angleRad);
      const y1 = center.y + outerRadius * Math.sin(angleRad);
      const x2 = center.x + (outerRadius - currentTickLength) * Math.cos(angleRad);
      const y2 = center.y + (outerRadius - currentTickLength) * Math.sin(angleRad);

      elements.push(
        <line
          key={`outer-tick-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#555"
          strokeWidth={isMajor ? 1.5 : 1}
        />
      );

      if (isMajor) {
        const x = center.x + (labelRadius - 10) * Math.cos(angleRad);
        const y = center.y + (labelRadius - 10) * Math.sin(angleRad);

        elements.push(
          <text
            key={`outer-label-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="12"
            fill="#333"
          >
            {i}°
          </text>
        );
      }
    }
    return elements;
  };
  
  // ======================
  // INNER TICKS + LABELS (360-0 decreasing clockwise)
  // ======================
  const getInnerTicksAndLabels = () => {
    const elements = [];
    const innerRadius = radius * 0.8; 
    const labelRadius = innerRadius - 20;
    const tickLength = 5;
    const majorTickLength = 10;
    
    for (let i = 0; i <= 360; i += 2) {
      const angleRad = (i * Math.PI) / 180;
      const isMajor = i % 10 === 0;
      const currentTickLength = isMajor ? majorTickLength : tickLength;

      const x1 = center.x + innerRadius * Math.cos(angleRad);
      const y1 = center.y + innerRadius * Math.sin(angleRad);
      const x2 = center.x + (innerRadius - currentTickLength) * Math.cos(angleRad);
      const y2 = center.y + (innerRadius - currentTickLength) * Math.sin(angleRad);

      elements.push(
        <line
          key={`inner-tick-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#000"
          strokeWidth={isMajor ? 1.5 : 1}
        />
      );

      if (isMajor) {
        const decreasingAngle = 360 - i;
        const x = center.x + (labelRadius - 10) * Math.cos(angleRad);
        const y = center.y + (labelRadius - 10) * Math.sin(angleRad);

        elements.push(
          <text
            key={`inner-label-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="12"
            fill="#333"
          >
            {decreasingAngle}°
          </text>
        );
      }
    }
    return elements;
  };

  // ======================
  // DRAWN ANGLE
  // ======================
  const getDrawnAngles = () => {
    if (!drawnAngles || !Array.isArray(drawnAngles) || drawnAngles.length === 0) {
      return null;
    }

    return drawnAngles.map((drawnAngle, index) => {
      const arcRadius = 50; 
      const arrowSize = 10;
      const lineLength = radius + 50;
      const baseLineX = center.x + lineLength;
      const baseLineY = center.y;
      
      const angleRad = Math.atan2(drawnAngle.endY, drawnAngle.endX);
      const handleLineX = center.x + lineLength * Math.cos(angleRad);
      const handleLineY = center.y + lineLength * Math.sin(angleRad);

      const startXArc = center.x + arcRadius;
      const startYArc = center.y;
      const endXArc = center.x + arcRadius * Math.cos(angleRad);
      const endYArc = center.y + arcRadius * Math.sin(angleRad);

      const angleDeg = Math.abs(drawnAngle.angle);
      const largeArcFlag = angleDeg > 180 ? 1 : 0;
      const sweepFlag = 1;

      const arcPath = `M ${startXArc} ${startYArc} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} ${sweepFlag} ${endXArc} ${endYArc}`;

      const arrowPoint1X = baseLineX - arrowSize * Math.cos(0.2);
      const arrowPoint1Y = baseLineY + arrowSize * Math.sin(0.2);
      const arrowPoint2X = baseLineX - arrowSize * Math.cos(0.2);
      const arrowPoint2Y = baseLineY - arrowSize * Math.sin(0.2);
      const baseArrowPoints = `${baseLineX},${baseLineY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`;

      const angleRadPlus = angleRad + 0.2;
      const angleRadMinus = angleRad - 0.2;
      const arrowPoint3X = handleLineX - arrowSize * Math.cos(angleRadPlus);
      const arrowPoint3Y = handleLineY - arrowSize * Math.sin(angleRadPlus);
      const arrowPoint4X = handleLineX - arrowSize * Math.cos(angleRadMinus);
      const arrowPoint4Y = handleLineY - arrowSize * Math.sin(angleRadMinus);
      const endArrowPoints = `${handleLineX},${handleLineY} ${arrowPoint3X},${arrowPoint3Y} ${arrowPoint4X},${arrowPoint4Y}`;

      return (
        <g key={`drawn-angle-${index}`}>
          {/* Angle Lines */}
          <line x1={center.x} y1={center.y} x2={baseLineX} y2={baseLineY} stroke="#000" strokeWidth="2" />
          <line x1={center.x} y1={center.y} x2={handleLineX} y2={handleLineY} stroke="#000" strokeWidth="2" />
          {/* Arrowheads */}
          <polygon points={baseArrowPoints} fill="#000" />
          <polygon points={endArrowPoints} fill="#000" />
          {/* Arc */}
          <path d={arcPath} fill="none" stroke="#008000" strokeWidth="2" />
          {/* Angle Text */}
          <text 
            x={center.x + arcRadius * 0.7 * Math.cos(angleRad / 2)} 
            y={center.y + arcRadius * 0.7 * Math.sin(angleRad / 2)}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="20"
            fill="#000"
            fontWeight="bold"
          >
            {drawnAngle.angle}°
          </text>
        </g>
      );
    });
  };

  // ======================
  // INNERMOST RADIAL LINES
  // ======================
  const getInnermostRadialLines = () => {
    const elements = [];
    const innermostRadius = radius * 0.1; 
    const radialLineEndRadius = thirdLayerRadius + 5;

    for (let i = 0; i <= 360; i += 15) {
      const angleRad = (i * Math.PI) / 180;

      const x1 = center.x + innermostRadius * Math.cos(angleRad);
      const y1 = center.y + innermostRadius * Math.sin(angleRad);
      const x2 = center.x + radialLineEndRadius * Math.cos(angleRad);
      const y2 = center.y + radialLineEndRadius * Math.sin(angleRad);

      elements.push(
        <line
          key={`radial-line-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#000"
          strokeWidth="1"
        />
      );
    }
    return elements;
  };

  // Toggle between half and full protractor
  const toggleHalfMode = () => {
    setIsHalfMode(!isHalfMode);
  };

  return (
    <svg
      width={radius * 2 + 60}
      height={radius * 2 + 60}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        cursor: isDraggingTool || isDraggingSecondLayer || isDraggingThirdLayer ? "grabbing" : "move",
        touchAction: "none",
        userSelect: "none",
        filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.1))",
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transition: 'transform 0.3s ease-in-out' // Smooth transition for scaling
      }}
      onMouseMove={handleDrag}
      onMouseUp={handleEndDrag}
      onMouseLeave={handleEndDrag}
      onTouchMove={(e) => {
        handleDrag(e);
        onToolDrag(e);
      }}
      onTouchEnd={handleEndDrag}
      onTouchCancel={handleEndDrag}
      onMouseMoveCapture={onToolDrag}
    >
      {/* Clip path for half-circle mode */}
      <defs>
        <clipPath id="halfProtractorClip">
          <rect x={center.x - radius} y={center.y - radius} width={radius * 2} height={radius} />
        </clipPath>
      </defs>

      <g clipPath={isHalfMode ? "url(#halfProtractorClip)" : ""}>
        {/* Outer Protractor Circle */}
        <circle
          cx={center.x}
          cy={center.y}
          r={radius}
          fill="#eef2ff"
          stroke={isFirstLayerActive ? "#800080" : "#ddd"}
          strokeWidth={isFirstLayerActive ? "2" : "1"}
          onMouseDown={startToolDrag}
          onTouchStart={startToolDrag}
          onClick={() => {
            setIsFirstLayerActive(true);
            setIsSecondLayerActive(false);
            setIsThirdLayerActive(false);
          }}
        />
        
        {/* Inner Transparent Circle (Scaling Layer) */}
        <circle
          cx={center.x}
          cy={center.y}
          r={radius * 0.8}
          fill="#c3dafe"
          opacity="0.8"
          stroke={isSecondLayerActive ? "#800080" : "#93c5fd"}
          strokeWidth={isSecondLayerActive ? "2" : "1"}
          onClick={() => {
            setIsSecondLayerActive(true);
            setIsFirstLayerActive(false);
            setIsThirdLayerActive(false);
          }}
          onMouseDown={handleSecondLayerDragStart}
          onTouchStart={handleSecondLayerDragStart}
          onMouseMove={handleSecondLayerDragMove}
          onTouchMove={handleSecondLayerDragMove}
          onMouseUp={handleSecondLayerDragEnd}
          onTouchEnd={handleSecondLayerDragEnd}
          cursor="grab"
        />

        {/* Outer Ticks and Labels */}
        {getOuterTicksAndLabels()}
        
        {/* Inner Ticks and Labels */}
        {getInnerTicksAndLabels()}

        {/* New Third Layer Boundary Circle (Rotation Layer) */}
        <circle
          cx={center.x}
          cy={center.y}
          r={thirdLayerRadius}
          fill="none"
          stroke={isThirdLayerActive ? "#800080" : "#93c5fd"}
          strokeWidth={isThirdLayerActive ? "2" : "1"}
          onClick={() => {
            setIsThirdLayerActive(true);
            setIsFirstLayerActive(false);
            setIsSecondLayerActive(false);
          }}
          onMouseDown={handleThirdLayerDragStart}
          onTouchStart={handleThirdLayerDragStart}
          onMouseMove={handleThirdLayerDragMove}
          onTouchMove={handleThirdLayerDragMove}
          onMouseUp={handleThirdLayerDragEnd}
          onTouchEnd={handleThirdLayerDragEnd}
          cursor="grab"
        />

        {/* Innermost Radial Lines */}
        {getInnermostRadialLines()}
        
        {/* Innermost circle with quadrants */}
        <circle
          cx={center.x}
          cy={center.y}
          r={radius * 0.1}
          fill="#fff"
          stroke="#ccc"
          strokeWidth="1"
        />
        <line x1={center.x - radius * 0.1} y1={center.y} x2={center.x + radius * 0.1} y2={center.y} stroke="#aaa" strokeWidth="1" />
        <line x1={center.x} y1={center.y - radius * 0.1} x2={center.x} y2={center.y + radius * 0.1} stroke="#aaa" strokeWidth="1" />
      </g>
      
      {/* Base line for a complete protractor look */}
      <line 
          x1={center.x - radius} 
          y1={center.y} 
          x2={center.x + radius} 
          y2={center.y} 
          stroke={isHalfMode ? "#ddd" : "transparent"} 
          strokeWidth="1" 
      />
      
      {/* This invisible rect over the baseline is for toggling the half/full mode */}
      <rect 
          x={center.x - radius} 
          y={center.y - 5} 
          width={radius * 2} 
          height={10} 
          fill="transparent" 
          cursor="pointer"
          onClick={toggleHalfMode}
          onTouchStart={toggleHalfMode}
      />

      {/* Drawn Angles */}
      {getDrawnAngles()}

      {/* Baseline */}
      <line
        x1={center.x}
        y1={center.y}
        x2={center.x + handlePos.x}
        y2={center.y + handlePos.y}
        stroke="#3b82f6"
        strokeWidth="2"
      />

      {/* Movable Arrow */}
      <line
        x1={center.x}
        y1={center.y}
        x2={center.x + handlePos.x}
        y2={center.y + handlePos.y}
        stroke="#3b82f6"
        strokeWidth="2"
      />

      {/* Draggable Handle */}
      <circle
        cx={center.x + handlePos.x}
        cy={center.y + handlePos.y}
        r="10"
        fill="#10b981"
        stroke="#059669"
        strokeWidth="2"
        cursor="grab"
        onMouseDown={handleStartDrag}
        onTouchStart={handleStartDrag}
      />
      
      {/* Center circle */}
      <circle
        cx={center.x}
        cy={center.y}
        r="5"
        fill="#3b82f6"
      />

      {/* Save Arrow */}
      <polygon
        points={`${center.x + radius + 10},${center.y} 
              ${center.x + radius + 25},${center.y + 7} 
              ${center.x + radius + 25},${center.y - 7}`}
        fill="#3b82f6"
        stroke="#1e40af"
        strokeWidth="1"
        cursor="pointer"
        onClick={triggerDrawAngle}
        onTouchStart={(e) => {
          e.preventDefault();
          triggerDrawAngle();
        }}
      />
      
      {/* Current Angle */}
      <text
        x={center.x}
        y={center.y + 10}
        textAnchor="middle"
        alignmentBaseline="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#3b82f6"
        style={{ userSelect: "none" }}
      >
        {angle}°
      </text>
    </svg>
  );
};

export default Protractor;
