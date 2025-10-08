export const drawGridBackground = (
  canvas,
  bgColor = "#001F54",
  gridSize = 50,
  lineColor = "rgba(255, 255, 255, 0.1)"
) => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;

  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
};
