// ShapeRenderer.js
import React from "react";
import { shapesConfig } from "./shapesConfig";

export default function ShapeRenderer({ shapeType, color = "#E3ECDD", stroke = "black", strokeWidth = 2, width = "100%", height = "100%" }) {
  const shape = shapesConfig[shapeType];
  if (!shape) return null;

  // If the config provides a div/React element directly
  if (shape.type === "div" && shape.render) {
    return shape.render(color, stroke, strokeWidth, width, height);
  }

  // Default: SVG shapes
  return (
    <svg
      viewBox={shape.viewBox || "0 0 100 100"}
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
    >
      {shape.render(color, stroke, strokeWidth)}
    </svg>
  );
}
