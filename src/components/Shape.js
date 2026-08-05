import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import ShapeRenderer from "../components/ShapeRenderer";
import { shapesConfig } from "../components/shapesConfig";

const Shape = ({ shape, onUpdate, onDelete, onEditingChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");
  const textEditorRef = useRef(null);
  const shapeRef = useRef(null);

  // Notify parent when this shape enters/exits inline edit mode
  React.useEffect(() => {
    if (typeof onEditingChange === 'function') onEditingChange(isEditing);
  }, [isEditing, onEditingChange]);

  // --- ROTATION ---
  const handleRotateStart = (e) => {
    e.stopPropagation();
    const rect = shapeRef.current.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const startAngle = (Math.atan2(e.clientY - center.y, e.clientX - center.x) * 180) / Math.PI;
    const startRotation = shape.rotation || 0;

    const onMouseMove = (moveEvent) => {
      const currentAngle =
        (Math.atan2(moveEvent.clientY - center.y, moveEvent.clientX - center.x) * 180) / Math.PI;
      const newRotation = startRotation + (currentAngle - startAngle);
      onUpdate({ ...shape, rotation: newRotation });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // --- RENDER SHAPE USING CONFIG ---
  const renderShape = () => {
    const config = shapesConfig[shape.type];
    if (!config) return <div>{shape.text || ""}</div>;

    return (
      <ShapeRenderer
        shapeType={shape.type}
        color={shape.fillColor || shape.color || "#E3ECDD"}
        stroke={shape.borderColor || shape.stroke || "black"}
        strokeWidth={shape.borderWidth || shape.strokeWidth || 2}
        width={shape.width}
        height={shape.height}
        viewBox={config.viewBox}
        renderFn={config.render}
      />
    );
  };

  // --- MEASUREMENT CALCULATION (cm units) ---
const calcMeasurements = () => {
  const pxToCm = (px) => (px * 2.54 / 96).toFixed(2); // convert px → cm with 2 decimals

  if (shape.type === "circle") {
    const r = shape.width / 2;
    return {
      label: `r = ${pxToCm(r)} cm`,
      area: (Math.PI * Math.pow(r * 2.54 / 96, 2)).toFixed(2), // area in cm²
      perimeter: (2 * Math.PI * (r * 2.54 / 96)).toFixed(2),   // perimeter in cm
    };
  } else {
    const w = shape.width;
    const h = shape.height;
    return {
      label: `${pxToCm(w)} cm × ${pxToCm(h)} cm`,
      area: (w * 2.54 / 96 * h * 2.54 / 96).toFixed(2), // area in cm²
      perimeter: (2 * (w * 2.54 / 96 + h * 2.54 / 96)).toFixed(2), // perimeter in cm
    };
  }
};

  const { label, area, perimeter } = calcMeasurements();

  const clipPathMap = {
    circle: 'circle(50% at 50% 50%)',
    triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    trapezoid: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
    parallelogram: 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)',
    octagon: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
    speechBubble: 'polygon(10% 10%, 90% 10%, 90% 70%, 60% 70%, 50% 90%, 40% 70%, 10% 70%)',
    cylinder: 'polygon(10% 10%, 90% 10%, 90% 80%, 10% 80%)',
    cylinder3d: 'ellipse(50% 10% at 50% 10%)',
    sphere3d: 'circle(50% at 50% 50%)',
    cube3d: 'polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)',
    pyramid3d: 'polygon(50% 0%, 90% 100%, 10% 100%)',
    star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    'brace-left': 'polygon(40% 5%, 20% 5%, 20% 30%, 10% 30%, 10% 70%, 20% 70%, 20% 95%, 40% 95%)',
    'brace-right': 'polygon(60% 5%, 80% 5%, 80% 30%, 90% 30%, 90% 70%, 80% 70%, 80% 95%, 60% 95%)',
    cloud: 'ellipse(50% 50% at 50% 50%)',
    plus: 'polygon(40% 10%, 60% 10%, 60% 40%, 90% 40%, 90% 60%, 60% 60%, 60% 90%, 40% 90%, 40% 60%, 10% 60%, 10% 40%, 40% 40%)',
    'arrow-right': 'polygon(0% 40%, 70% 40%, 70% 20%, 100% 50%, 70% 80%, 70% 60%, 0% 60%)',
    'arrow-left': 'polygon(100% 40%, 30% 40%, 30% 20%, 0% 50%, 30% 80%, 30% 60%, 100% 60%)',
    'arrow-both': 'polygon(15% 40%, 45% 40%, 45% 20%, 55% 20%, 55% 40%, 85% 40%, 85% 20%, 100% 50%, 85% 80%, 85% 60%, 55% 60%, 55% 80%, 45% 80%, 45% 60%, 15% 60%)',
    hamburger: 'polygon(10% 20%, 90% 20%, 90% 30%, 10% 30%, 10% 40%, 90% 40%, 90% 50%, 10% 50%, 10% 60%, 90% 60%, 90% 70%, 10% 70%)',
  };

  const clipPathStyle = clipPathMap[shape.type] ? { clipPath: clipPathMap[shape.type] } : {};

  return (
    <Rnd
      size={{ width: shape.width, height: shape.height }}
      position={{ x: shape.x, y: shape.y }}
      onDragStop={(e, d) => onUpdate({ ...shape, x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, position) =>
        onUpdate({
          ...shape,
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          x: position.x,
          y: position.y,
        })
      }
      style={{ zIndex: 10, position: "absolute", pointerEvents: "auto" }}
      cancel=".shape-no-drag"
    >
      <div
        ref={shapeRef}
        style={{
          width: "100%",
          height: "100%",
          transform: `rotate(${shape.rotation || 0}deg)`,
          position: "relative",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!shape.isLocked) {
            setEditingText(shape.text || "");
            setIsEditing(true);
          }
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            ...clipPathStyle,
          }}
        >
          {renderShape()}

          {/* Text shown inside shape when not editing */}
          {!isEditing && shape.text && (
            <div
              style={{
                position: 'absolute',
                inset: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: shape.textAlign || 'center',
                pointerEvents: 'none',
                whiteSpace: 'pre-wrap',
                overflow: 'hidden',
                zIndex: 20,
                fontSize: `${shape.fontSize || 14}px`,
                fontWeight: shape.fontWeight || 'normal',
                fontStyle: shape.fontStyle || 'normal',
                color: shape.textColor || '#000',
                maxWidth: 'calc(100% - 16px)',
                maxHeight: 'calc(100% - 16px)',
              }}
            >
              {shape.text}
            </div>
          )}

          {/* Inline editor for text when double-clicked */}
          {isEditing && (
            <textarea
              ref={textEditorRef}
              className="shape-no-drag"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                if ((shape.text || '') !== editingText) onUpdate({ ...shape, text: editingText });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsEditing(false);
                } else if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setIsEditing(false);
                  if ((shape.text || '') !== editingText) onUpdate({ ...shape, text: editingText });
                }
              }}
              style={{
                position: 'absolute',
                inset: '8px',
                width: 'calc(100% - 16px)',
                height: 'calc(100% - 16px)',
                zIndex: 40,
                resize: 'none',
                padding: 8,
                fontSize: `${shape.fontSize || 14}px`,
                fontWeight: shape.fontWeight || 'normal',
                fontStyle: shape.fontStyle || 'normal',
                color: shape.textColor || '#000',
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
              autoFocus
            />
          )}
        </div>

        {isHovered && (
          <>
            {/* Delete button */}
            <div
              className="shape-no-drag"
              onClick={() => onDelete(shape.id)}
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                width: 20,
                height: 20,
                background: "red",
                color: "white",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: 20,
              }}
            >
              ✖
            </div>

            {/* Rotation handle */}
            <div
              className="shape-no-drag"
              onMouseDown={(e) => handleRotateStart(e)}
              style={{
                position: "absolute",
                bottom: 5,
                right: 5,
                width: 12,
                height: 12,
                background: "blue",
                borderRadius: "50%",
                cursor: "grab",
                zIndex: 20,
              }}
            />

            {/* Color picker (hover) */}
            <input
              title="Fill color"
              className="shape-no-drag"
              type="color"
              value={shape.color || '#E3ECDD'}
              onChange={(ev) => onUpdate({ ...shape, color: ev.target.value })}
              style={{
                position: 'absolute',
                top: 6,
                left: 6,
                width: 28,
                height: 28,
                padding: 0,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                zIndex: 30,
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: "-50px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.75)",
                color: "white",
                fontSize: "10px",
                padding: "4px 6px",
                borderRadius: "4px",
                pointerEvents: "none",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              <div>{label}</div>
              <div>Area: {area} cm²</div>
              <div>Perimeter: {perimeter} cm</div>
              <div>Angle: {Math.round(shape.rotation || 0)}°</div>
            </div>
          </>
        )}
      </div>
    </Rnd>
  );
};

export default Shape;
