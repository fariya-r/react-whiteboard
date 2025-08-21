import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import ShapeRenderer from "../components/ShapeRenderer";
import { shapesConfig } from "../components/shapesConfig";

const Shape = ({ shape, onUpdate, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const shapeRef = useRef(null);

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
        color={shape.color || "#E3ECDD"}
        stroke={shape.stroke || "black"}
        strokeWidth={shape.strokeWidth || 2}
        width={shape.width}
        height={shape.height}
        viewBox={config.viewBox}
        renderFn={config.render}
      />
    );
  };

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
      style={{ zIndex: 10, position: "absolute" }}
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
      >
        {renderShape()}

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
          </>
        )}
      </div>
    </Rnd>
  );
};

export default Shape;
