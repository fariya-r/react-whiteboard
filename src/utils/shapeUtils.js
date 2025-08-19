// src/utils/shapeUtils.js

 

// ================== Draw Any Shape from State ==================
export function drawShape(ctx, shape) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = shape.color || '#000';
    ctx.lineWidth = shape.lineWidth || 2;

    if (shape.type === 'rectangle') {
        const x = Math.min(shape.startX, shape.endX);
        const y = Math.min(shape.startY, shape.endY);
        const width = Math.abs(shape.endX - shape.startX);
        const height = Math.abs(shape.endY - shape.startY);
        ctx.strokeRect(x, y, width, height);
    } else if (shape.type === 'circle') {
        const dx = shape.endX - shape.startX;
        const dy = shape.endY - shape.startY;
        const radius = Math.sqrt(dx * dx + dy * dy);
        ctx.arc(shape.startX, shape.startY, radius, 0, Math.PI * 2);
        ctx.stroke();
    } else if (shape.type === 'line' || shape.type === 'arrow') {
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
        if (shape.type === 'arrow') {
            drawArrowhead(ctx, { x: shape.startX, y: shape.startY }, { x: shape.endX, y: shape.endY });
        }
    }

    ctx.closePath();
    ctx.restore();
}
export const drawArrowhead = (ctx, from, to) => {
    const headlen = 10;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headlen * Math.cos(angle - Math.PI / 6),
      to.y - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headlen * Math.cos(angle + Math.PI / 6),
      to.y - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
    ctx.closePath();
  };
export const isPointInShape = (shape, x, y) => {
    const { type, startX, startY, endX, endY } = shape;
    if (type === 'rectangle') {
        return (
            x >= Math.min(startX, endX) &&
            x <= Math.max(startX, endX) &&
            y >= Math.min(startY, endY) &&
            y <= Math.max(startY, endY)
        );
    }
    if (type === 'circle') {
        const dx = x - startX;
        const dy = y - startY;
        const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        return Math.sqrt(dx * dx + dy * dy) <= radius;
    }
    if (type === 'line' || type === 'arrow') {
        return isNearLine(startX, startY, endX, endY, x, y);
    }
    return false;
};

const isNearLine = (x1, y1, x2, y2, px, py, tolerance = 5) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return dx * dx + dy * dy <= tolerance * tolerance;
};



// ================== Shape Resizing ==================
export const resizeShape = (shape, handle, x, y) => {
    const { type } = shape;
    if (type === 'rectangle') {
        if (handle.position.includes('n')) shape.startY = y;
        if (handle.position.includes('s')) shape.endY = y;
        if (handle.position.includes('w')) shape.startX = x;
        if (handle.position.includes('e')) shape.endX = x;
    }
    else if (type === 'circle') {
        shape.endX = x;
        shape.endY = y;
    }
    else if (type === 'line' || type === 'arrow') {
        if (handle.position === 'start') {
            shape.startX = x;
            shape.startY = y;
        }
        if (handle.position === 'end') {
            shape.endX = x;
            shape.endY = y;
        }
    }
    return shape;
};
export const drawShapePreview = ({
    ctx,
    tool,
    lineStart,
    currentPoint,
    pivotPoint,
    isDrawingCircle,
    prevImg,
    previousSnapshot,
    canvasRef,
    color,
    lineWidth,
    setCurrentPoint,
}) => {
    if (!ctx) return;

    const { x, y } = currentPoint;

    // Restore previous snapshot
    if (previousSnapshot) {
        prevImg.src = previousSnapshot;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(prevImg, 0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    if (tool === "rectangle" && lineStart) {
        ctx.strokeRect(lineStart.x, lineStart.y, x - lineStart.x, y - lineStart.y);
    }
    else if (tool === "circle" && lineStart) {
        const dx = x - lineStart.x;
        const dy = y - lineStart.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        ctx.arc(lineStart.x, lineStart.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
    else if (tool === "line" && lineStart) {
        ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    else if (tool === "arrow" && lineStart) {
        ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        drawArrowhead(ctx, lineStart, { x, y });
    }
    else if (tool === "compass" && isDrawingCircle && pivotPoint) {
        setCurrentPoint({ x, y });
        const dx = x - pivotPoint.x;
        const dy = y - pivotPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        ctx.arc(pivotPoint.x, pivotPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    ctx.closePath();
};
export const finalizeShape = ({
    ctx,
    tool,
    lineStart,
    endPoint,
    pivotPoint,
    currentPoint,
    isDrawingCircle,
    color,
    lineWidth
}) => {
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    if (tool === "line" && lineStart) {
        ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
    }
    else if (tool === "rectangle" && lineStart) {
        ctx.strokeRect(lineStart.x, lineStart.y, endPoint.x - lineStart.x, endPoint.y - lineStart.y);
    }
    else if (tool === "circle" && lineStart) {
        const dx = endPoint.x - lineStart.x;
        const dy = endPoint.y - lineStart.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        ctx.arc(lineStart.x, lineStart.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
    else if (tool === "arrow" && lineStart) {
        ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
        drawArrowhead(ctx, lineStart, endPoint);
    }
    else if (tool === "compass" && isDrawingCircle && pivotPoint && currentPoint) {
        const dx = currentPoint.x - pivotPoint.x;
        const dy = currentPoint.y - pivotPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        ctx.arc(pivotPoint.x, pivotPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    ctx.closePath();
};