// useInfiniteCanvas.js

import { useEffect, useCallback } from 'react';

const useInfiniteCanvas = (canvasRef, contextRef, scale, panOffset) => {
  const resetCanvasTransform = useCallback(() => {
    if (!contextRef.current || !canvasRef.current) return;
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
  
    // Reset transformations
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  
    // Clear everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // 🔥 Redraw background + grid
    drawBackgroundAndGrid(ctx, canvas);
  }, [contextRef, canvasRef]);
  
  useEffect(() => {
    if (contextRef.current) {
      const ctx = contextRef.current;

      // Apply the new transformation based on the current scale and pan offset
      ctx.setTransform(scale, 0, 0, scale, panOffset.x, panOffset.y);
    }
  }, [scale, panOffset, contextRef]);
  
  return {
    resetCanvasTransform
  };
};

export default useInfiniteCanvas;