import React, { useState } from "react";
import { Stage, Layer, Rect, Circle, Line, Arrow } from "react-konva";
import { updateShape } from "../utils/firestoreUtils";

export default function EditableCanvas({ shapes, onAddShape, onUpdateShape, onDeleteShape }) {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div>
      {/* Buttons */}
      <button
        onClick={() =>
          onAddShape({
            type: "rect",
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            fill: "transparent",
            stroke: "black",
            strokeWidth: 2,
          })
        }
      >
        Rectangle
      </button>

      <button
        onClick={() =>
          onAddShape({
            type: "circle",
            x: 100,
            y: 100,
            radius: 50,
            fill: "transparent",
            stroke: "black",
            strokeWidth: 2,
          })
        }
      >
        Circle
      </button>

      <button
        onClick={() =>
          onAddShape({
            type: "line",
            points: [20, 20, 100, 100],
            stroke: "black",
            strokeWidth: 2,
          })
        }
      >
        Line
      </button>

      <button
        onClick={() =>
          onAddShape({
            type: "arrow",
            points: [20, 20, 100, 100],
            stroke: "black",
            strokeWidth: 2,
          })
        }
      >
        Arrow
      </button>

      {/* Canvas */}
      <Stage width={800} height={600} style={{ border: "1px solid gray" }}>
        <Layer>
          {shapes.map((shape) => {
            if (shape.type === "rect") {
              return (
                <Rect
                  key={shape.id}
                  {...shape}
                  draggable
                  onClick={() => setSelectedId(shape.id)}
                  onDragEnd={(e) => {
                    const updated = { ...shape, x: e.target.x(), y: e.target.y() };
                    onUpdateShape(shape.id, { x: updated.x, y: updated.y }); // local update
                    updateShape(updated, shapes); // 🔥 Firestore update
                  }}
                                    onDblClick={() => onDeleteShape(shape.id)}
                />
              );
            }
            if (shape.type === "circle") {
              return (
                <Circle
                  key={shape.id}
                  {...shape}
                  draggable
                  onClick={() => setSelectedId(shape.id)}
                  onDragEnd={(e) => {
                    const updated = { ...shape, x: e.target.x(), y: e.target.y() };
                    onUpdateShape(shape.id, { x: updated.x, y: updated.y });
                    updateShape(updated, shapes);
                  }}
                                    onDblClick={() => onDeleteShape(shape.id)}
                />
              );
            }
            if (shape.type === "line") {
              return (
                <Line
                  key={shape.id}
                  {...shape}
                  draggable
                  onClick={() => setSelectedId(shape.id)}
                  onDragEnd={(e) => {
                    const updated = { ...shape, points: [e.target.x(), e.target.y(), 200, 200] };
                    onUpdateShape(shape.id, { points: updated.points });
                    updateShape(updated, shapes);
                  }}
                                    onDblClick={() => onDeleteShape(shape.id)}
                />
              );
            }
            if (shape.type === "arrow") {
              return (
                <Arrow
                  key={shape.id}
                  {...shape}
                  draggable
                  onClick={() => setSelectedId(shape.id)}
                  onDragEnd={(e) => {
                    const updated = { ...shape, points: [e.target.x(), e.target.y(), 200, 200] };
                    onUpdateShape(shape.id, { points: updated.points });
                    updateShape(updated, shapes);
                  }}
                                    onDblClick={() => onDeleteShape(shape.id)}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
}
