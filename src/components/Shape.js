import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";

const Shape = ({ shape, onUpdate, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const shapeRef = useRef(null);

  // Rotation logic
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

  // Base style
  let shapeStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
    height: "100%",
    transform: `rotate(${shape.rotation || 0}deg)`,
  };

  if (shape.type === "rectangle") shapeStyle.backgroundColor = shape.color || "#E3ECDD";
  if (shape.type === "circle") {
    shapeStyle.backgroundColor = shape.color || "#E3ECDD";
    shapeStyle.borderRadius = "50%";
  }
  if (shape.type === "line") {
    shapeStyle.backgroundColor =  "black";
    shapeStyle.height = "2px";
    shapeStyle.width = "100%";
  }

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
      style={{ zIndex: 10 }}
      cancel=".shape-no-drag"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
    >
      <div
        ref={shapeRef}
        style={{ ...shapeStyle, overflow: "visible" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {shape.text || ""}

        {/* Arrow shape */}
        {shape.type === "arrow" && (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "4px",
              backgroundColor: shape.color || "black",
              transform: `rotate(${shape.rotation || 0}deg)`,
              transformOrigin: "left center",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "-6px",
                width: 0,
                height: 0,
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderLeft: `12px solid ${shape.color || "black"}`,
              }}
            />
          </div>
        )}
        
        {isHovered && shape.type === "line" && (
  <>
    {/* delete button */}
    <button
      className="shape-no-drag"
      onClick={() => onDelete(shape.id)}
      style={{
        position: "absolute",
        top: -25,   // line ke upar thoda space
        right: 0,
        zIndex: 20,
      }}
    >
      ✖
    </button>

    {/* rotation dot */}
    <div
      className="shape-no-drag"
      onMouseDown={(e) => {
        e.stopPropagation();
        handleRotateStart(e);
      }}
      style={{
        position: "absolute",
        bottom: -20,  // line ke neeche dot
        right: "50%",
        transform: "translateX(50%)",
        width: 12,
        height: 12,
        borderRadius: "50%",
        backgroundColor: "blue",
        cursor: "grab",
        zIndex: 20,
        pointerEvents: "auto",
      }}
    />
  </>
)}


            {isHovered && shape.type === "circle" && (
              <>
                {/* delete button */}
                <div
                  className="shape-no-drag"
                  onClick={() => onDelete(shape.id)}
                  style={{
                    position: "absolute",
                    top: "15%",
                    right: "15%",
                    width: "18px",
                    height: "18px",
                    background: "red",
                    color: "white",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    cursor: "pointer",
                    zIndex: 20,
                    pointerEvents: "auto",
                  }}
                >
                  ✖
                </div>

                {/* rotation dot */}
                <div
                  className="shape-no-drag"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleRotateStart(e);
                  }}
                  style={{
                    position: "absolute",
                    bottom: "15%",
                    right: "15%",
                    width: "12px",
                    height: "12px",
                    background: "blue",
                    borderRadius: "50%",
                    cursor: "grab",
                    zIndex: 20,
                    pointerEvents: "auto",
                  }}
                />
              </>
            )}

            {/* Other shapes → show buttons only on hover */}
            {isHovered && shape.type !== "circle" && (
              <>
                <button
                  className="shape-no-drag"
                  onClick={() => onDelete(shape.id)}
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    zIndex: 20,
                  }}
                >
                  x
                </button>
                <div
                  className="shape-no-drag"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleRotateStart(e);
                  }}
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "red",
                    cursor: "grab",
                    zIndex: 20,
                    pointerEvents: "auto",
                  }}
                />
              </>
            )}
          </div>
    </Rnd>
  );
};

export default Shape;
