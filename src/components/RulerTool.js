import React, { useEffect, useState, useCallback } from 'react';

const RulerTool = ({
  showRuler,
  setShowRuler,
  rulerPosition,
  setRulerPosition,
  isDraggingRuler,
  setIsDraggingRuler,
  rulerAngle,               // ✅ angle as prop
  setRulerAngle,            // ✅ update angle from parent
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStartMouseAngle, setRotationStartMouseAngle] = useState(0);
  const [rotationStartRulerAngle, setRotationStartRulerAngle] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const RULER_WIDTH = 600;
  const RULER_HEIGHT = 70;
  const INCH_TO_PIXELS = 25.4;

  const getMouseAngleRelativeToRulerCenter = useCallback(
    (e) => {
      const centerX = rulerPosition.x + RULER_WIDTH / 2;
      const centerY = rulerPosition.y + RULER_HEIGHT / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      return Math.atan2(dy, dx) * (180 / Math.PI);
    },
    [rulerPosition]
  );
  
  const handleMouseDown = (e) => {
    e.stopPropagation();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const rotationHotspotSize = 20;
    const rulerRight = rulerPosition.x + RULER_WIDTH;
    const rulerTop = rulerPosition.y;

    const isClickInRotationHotspot =
      mouseX >= rulerRight - rotationHotspotSize &&
      mouseX <= rulerRight &&
      mouseY >= rulerTop &&
      mouseY <= rulerTop + rotationHotspotSize;

    if (isClickInRotationHotspot) {
      setIsRotating(true);
      setRotationStartMouseAngle(getMouseAngleRelativeToRulerCenter(e));
      setRotationStartRulerAngle(rulerAngle);
    } else {
      setIsDraggingRuler(true);
      setDragOffset({
        x: mouseX - rulerPosition.x,
        y: mouseY - rulerPosition.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isRotating) {
        const currentMouseAngle = getMouseAngleRelativeToRulerCenter(e);
        const angleDiff = currentMouseAngle - rotationStartMouseAngle;
        setRulerAngle(rotationStartRulerAngle + angleDiff); // ✅ angle update to parent
      } else if (isDraggingRuler) {
        setRulerPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingRuler(false);
      setIsRotating(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDraggingRuler,
    isRotating,
    dragOffset,
    rotationStartMouseAngle,
    rotationStartRulerAngle,
    setRulerPosition,
    setRulerAngle,
    getMouseAngleRelativeToRulerCenter,
  ]);

  if (!showRuler) return null;
  // ---- Top (cm) markings ----
const topMarkings = [];
const cmToPx = 10;
const topOffset = 2;
const maxCm = 6; // stop at 6 cm

for (let i = 0; i <= maxCm * 10; i++) {
  const isCm = i % 10 === 0;
  const isHalfCm = i % 5 === 0;
  const x = i * cmToPx;

  let length = isCm ? 10 : isHalfCm ? 7 : 4;

  // draw the line
  topMarkings.push(
    <line
      key={`cm-marking-${i}`}
      x1={x}
      y1={topOffset}
      x2={x}
      y2={topOffset + length}
      stroke="#000"
      strokeWidth="1"
    />
  );

  // Add numbers (but skip "6")
  if (isCm) {
    const cmValue = i / 10;

    // Move "0" a little right
    const textX = cmValue === 0 ? x + 6 : x;

    if (cmValue !== 6) {
      topMarkings.push(
        <text
          key={`cm-text-${i}`}
          x={textX}
          y={topOffset + length + 12}
          fontSize="12"
          textAnchor="middle"
          fill="#000"
          fontFamily="Arial"
        >
          {cmValue}
        </text>
      );
    }
  }
}
 // ---- Bottom (inches) markings ----
const bottomMarkings = [];
const bottomOffset = RULER_HEIGHT; // ruler bottom edge
const totalInches = Math.floor(RULER_WIDTH / INCH_TO_PIXELS); // only full inches

for (let i = 0; i <= totalInches; i++) {
  const x = i * INCH_TO_PIXELS;

  // Make sure we stay inside ruler
  if (x > RULER_WIDTH) break;

  // Main inch line
  bottomMarkings.push(
    <line
      key={`inch-marking-${i}`}
      x1={x}
      y1={bottomOffset}
      x2={x}
      y2={bottomOffset - 10}
      stroke="#000"
      strokeWidth="1.5"
    />
  );

  // Numbers
  if (i !== 6) {
    bottomMarkings.push(
      <text
        key={`inch-text-${i}`}
        x={i === 0 ? x + 6 : x}
        y={bottomOffset - 12}
        fontSize="12"
        textAnchor="middle"
        fill="#000"
        fontFamily="Arial"
      >
        {i}
      </text>
    );
  }

  // Subdivisions (inside ruler only)
  for (let j = 1; j < 8; j++) {
    const subX = x + (j * INCH_TO_PIXELS) / 8;
    if (subX >= RULER_WIDTH) continue; // skip those outside

    let subLength = j % 4 === 0 ? 8 : j % 2 === 0 ? 5 : 3;
    bottomMarkings.push(
      <line
        key={`sub-inch-${i}-${j}`}
        x1={subX}
        y1={bottomOffset}
        x2={subX}
        y2={bottomOffset - subLength}
        stroke="#000"
        strokeWidth="1"
      />
    );
  }
}


  return (
    <div
    className="absolute cursor-grab rounded-md shadow-lg"
    onMouseDown={handleMouseDown}
    style={{
      left: `${rulerPosition.x}px`,
      top: `${rulerPosition.y}px`,
      width: `${RULER_WIDTH}px`,
      height: `${RULER_HEIGHT}px`,
      userSelect: 'none',
      zIndex: 20,
      transform: `rotate(${rulerAngle}deg)`, // ✅ ruler tilt from parent
      transformOrigin: 'center center',
    }}
  >
      <svg
        width={RULER_WIDTH}
        height={RULER_HEIGHT}
        className="w-full h-full rounded-md"
        style={{ overflow: 'visible' }}
      >
        <rect
          x="0"
          y="0"
          width={RULER_WIDTH}
          height={RULER_HEIGHT}
          fill="#FFC107"
          rx="5"
          ry="5"
          stroke="#E6A800"
          strokeWidth="1"
        />
        <g>{topMarkings}</g>
        <g>{bottomMarkings}</g>

        <rect
          x={RULER_WIDTH - 20}
          y="0"
          width="20"
          height="20"
          fill="#FFC107"
          stroke="#E6A800"
          strokeWidth="1"
          className="rounded-bl-md"
          style={{ cursor: 'nw-resize' }}
        />
      </svg>
    </div>
  );
};

export default RulerTool;
