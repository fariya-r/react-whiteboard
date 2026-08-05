export const drawGridBackground = (
  canvas,
  bgColor = "#001F54",
  gridSize = 50,
  gridStyle = 'lines',
  lineColor = "rgba(255, 255, 255, 0.1)"
) => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (gridStyle === 'empty') return;

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;

  if (gridStyle === 'lines') {
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
  } else if (gridStyle === 'dots') {
    const radius = 1;
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x + 0.5, y + 0.5, radius, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
      }
    }
  }
};
