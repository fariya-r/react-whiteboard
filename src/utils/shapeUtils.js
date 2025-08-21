// // src/utils/shapeUtils.js

// export function drawShape(ctx, shape) {
//     ctx.strokeStyle = shape.color;
//     ctx.lineWidth = shape.lineWidth;
//     ctx.beginPath();

//     switch (shape.type) {
//         case "line":
//             ctx.moveTo(shape.x, shape.y);
//             ctx.lineTo(shape.x2, shape.y2);
//             break;

//         case "rectangle":
//             ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
//             break;

//         case "circle":
//             ctx.arc(
//                 shape.x + shape.width / 2,
//                 shape.y + shape.height / 2,
//                 Math.min(Math.abs(shape.width), Math.abs(shape.height)) / 2,
//                 0,
//                 Math.PI * 2
//             );
//             break;

//             case "arrow-right":
//                 drawArrow(
//                   ctx,
//                   shape.x,
//                   shape.y + shape.height / 2,
//                   shape.x + shape.width,
//                   shape.y + shape.height / 2,
//                   false,
//                   shape.color,
//                   shape.lineWidth
//                 );
//                 break;
              
//               case "arrow-left":
//                 drawArrow(
//                   ctx,
//                   shape.x + shape.width,
//                   shape.y + shape.height / 2,
//                   shape.x,
//                   shape.y + shape.height / 2,
//                   false,
//                   shape.color,
//                   shape.lineWidth
//                 );
//                 break;
              
//               case "arrow-both":
//                 drawArrow(
//                   ctx,
//                   shape.x,
//                   shape.y + shape.height / 2,
//                   shape.x + shape.width,
//                   shape.y + shape.height / 2,
//                   true,
//                   shape.color,
//                   shape.lineWidth
//                 );
//                 break;
              
            
//         case "triangle":
//             ctx.moveTo(shape.x + shape.width / 2, shape.y);
//             ctx.lineTo(shape.x, shape.y + shape.height);
//             ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
//             ctx.closePath();
//             break;

//         case "diamond":
//             ctx.moveTo(shape.x + shape.width / 2, shape.y);
//             ctx.lineTo(shape.x, shape.y + shape.height / 2);
//             ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
//             ctx.lineTo(shape.x + shape.width, shape.y + shape.height / 2);
//             ctx.closePath();
//             break;

//         case "star":
//             drawStar(ctx, shape.x + shape.width / 2, shape.y + shape.height / 2, 5, Math.min(shape.width, shape.height) / 2, Math.min(shape.width, shape.height) / 4);
//             break;

//         case "hexagon":
//             drawPolygon(ctx, shape.x + shape.width / 2, shape.y + shape.height / 2, 6, Math.min(shape.width, shape.height) / 2);
//             break;

//         case "cylinder":
//             drawCylinder(ctx, shape);
//             break;

//         default:
//             break;
//             case "braceLeft": {
//                 const x = shape.x;
//                 const y = shape.y;
//                 const width = shape.width;
//                 const height = shape.height;
    
//                 const midY = y + height / 2;
//                 ctx.beginPath();
//                 ctx.moveTo(x + width, y);
//                 ctx.bezierCurveTo(x, y, x, midY, x + width, midY);
//                 ctx.bezierCurveTo(x, midY, x, y + height, x + width, y + height);
//                 break;
//             }
    
//             case "braceRight": {
//                 const x = shape.x;
//                 const y = shape.y;
//                 const width = shape.width;
//                 const height = shape.height;
    
//                 const midY = y + height / 2;
//                 ctx.beginPath();
//                 ctx.moveTo(x, y);
//                 ctx.bezierCurveTo(x + width, y, x + width, midY, x, midY);
//                 ctx.bezierCurveTo(x + width, midY, x + width, y + height, x, y + height);
//                 break;
//             }
    
//             case "cloud": {
//                 const x = shape.x;
//                 const y = shape.y;
//                 const width = shape.width;
//                 const height = shape.height;
    
//                 ctx.beginPath();
//                 const r = Math.min(width, height) / 4;
//                 ctx.arc(x + r, y + r, r, Math.PI * 0.5, Math.PI * 1.5);
//                 ctx.arc(x + width - r, y + r, r, Math.PI * 1.0, Math.PI * 2.0);
//                 ctx.arc(x + width - r, y + height - r, r, Math.PI * 1.5, Math.PI * 0.5);
//                 ctx.arc(x + r, y + height - r, r, Math.PI * 2.0, Math.PI * 1.0);
//                 ctx.closePath();
//                 break;
//             }
    
//             case "plus": {
//                 const x = shape.x;
//                 const y = shape.y;
//                 const width = shape.width;
//                 const height = shape.height;
    
//                 const cx = x + width / 2;
//                 const cy = y + height / 2;
//                 const arm = Math.min(width, height) / 4;
                
//                 ctx.beginPath();
//                 ctx.moveTo(cx - arm, cy);
//                 ctx.lineTo(cx + arm, cy);
//                 ctx.moveTo(cx, cy - arm);
//                 ctx.lineTo(cx, cy + arm);
//                 break;
//             }
    
                            
//     }

//     ctx.stroke();
// }

// function drawArrow(ctx, fromX, fromY, toX, toY, bothSides, color, lineWidth = 2) {
//     const headLength = 15; // arrowhead ka size
//     const angle = Math.atan2(toY - fromY, toX - fromX);
  
//     ctx.strokeStyle = color;
//     ctx.fillStyle = color;
//     ctx.lineWidth = lineWidth;
  
//     // 🔹 Line ko arrowhead ke base tak hi draw karo
//     const lineEndX = toX - headLength * Math.cos(angle);
//     const lineEndY = toY - headLength * Math.sin(angle);
  
//     ctx.beginPath();
//     ctx.moveTo(fromX, fromY);
//     ctx.lineTo(lineEndX, lineEndY);
//     ctx.stroke();
  
//     // 🔹 Arrowhead (end)
//     ctx.beginPath();
//     ctx.moveTo(toX, toY);
//     ctx.lineTo(
//       toX - headLength * Math.cos(angle - Math.PI / 6),
//       toY - headLength * Math.sin(angle - Math.PI / 6)
//     );
//     ctx.lineTo(
//       toX - headLength * Math.cos(angle + Math.PI / 6),
//       toY - headLength * Math.sin(angle + Math.PI / 6)
//     );
//     ctx.closePath();
//     ctx.fill();
  
//     if (bothSides) {
//       // 🔹 Arrowhead (start)
//       ctx.beginPath();
//       ctx.moveTo(fromX, fromY);
//       ctx.lineTo(
//         fromX + headLength * Math.cos(angle - Math.PI / 6),
//         fromY + headLength * Math.sin(angle - Math.PI / 6)
//       );
//       ctx.lineTo(
//         fromX + headLength * Math.cos(angle + Math.PI / 6),
//         fromY + headLength * Math.sin(angle + Math.PI / 6)
//       );
//       ctx.closePath();
//       ctx.fill();
//     }
//   }
  

// function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
//     let rot = (Math.PI / 2) * 3;
//     let x = cx;
//     let y = cy;
//     const step = Math.PI / spikes;

//     ctx.moveTo(cx, cy - outerRadius);
//     for (let i = 0; i < spikes; i++) {
//         x = cx + Math.cos(rot) * outerRadius;
//         y = cy + Math.sin(rot) * outerRadius;
//         ctx.lineTo(x, y);
//         rot += step;

//         x = cx + Math.cos(rot) * innerRadius;
//         y = cy + Math.sin(rot) * innerRadius;
//         ctx.lineTo(x, y);
//         rot += step;
//     }
//     ctx.lineTo(cx, cy - outerRadius);
//     ctx.closePath();
// }

// function drawPolygon(ctx, x, y, sides, radius) {
//     const step = (2 * Math.PI) / sides;
//     ctx.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0));
//     for (let i = 1; i <= sides; i++) {
//         ctx.lineTo(x + radius * Math.cos(step * i), y + radius * Math.sin(step * i));
//     }
//     ctx.closePath();
// }

// function drawCylinder(ctx, shape) {
//     const x = shape.x;
//     const y = shape.y;
//     const w = shape.width;
//     const h = shape.height;

//     const rx = w / 2;
//     const ry = 20;

//     // Top ellipse
//     ctx.ellipse(x + rx, y, rx, ry, 0, 0, Math.PI * 2);

//     // Sides
//     ctx.moveTo(x, y);
//     ctx.lineTo(x, y + h);
//     ctx.moveTo(x + w, y);
//     ctx.lineTo(x + w, y + h);

//     // Bottom ellipse (dashed look by arc)
//     ctx.moveTo(x, y + h);
//     ctx.ellipse(x + rx, y + h, rx, ry, 0, 0, Math.PI, false);
// }
