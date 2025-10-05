// src/hooks/useWhiteboardActions.js
import { useCallback } from 'react';

const useWhiteboardActions = (
    canvasRef,
    contextRef,
    history,
    setHistory,
    redoStack,
    setRedoStack,
    setScale,
    setTool,
    setShowRuler,
    setActiveTextBox,
    setTextBoxes,
    setCircles,
    setShapes,
    setPivotPoint,
    setCurrentPoint,
    setIsDrawingCircle,
    setIsDraggingCompass,
    setCompassAngle,
    setCompassPosition,
    setTextEntries,
    setBackgroundSnapshot
) => {
    //
    // --- Undo and Redo Functions ---
    //

    const restoreCanvas = useCallback((snapshot) => {
      const ctx = contextRef.current;
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (snapshot) {
          const img = new Image();
          img.src = snapshot;
          img.onload = () => {
              ctx.drawImage(img, 0, 0);
          };
      }
    }, [canvasRef, contextRef]);
    
const handleUndo = useCallback(() => {
  if (history.length <= 1) return;

  const lastSnapshot = history[history.length - 1];
  const newHistory = history.slice(0, -1);

  setHistory(newHistory);
  setRedoStack(prev => [...prev, lastSnapshot]);

  const prevSnapshot = newHistory[newHistory.length - 1] || null;
  setBackgroundSnapshot(prevSnapshot); // Correctly sets the new background

  // Immediately restore the canvas to the new state
  restoreCanvas(prevSnapshot);

}, [history, setHistory, redoStack, setRedoStack, setBackgroundSnapshot, restoreCanvas]);

const handleRedo = useCallback(() => {
  if (redoStack.length > 0) {
      const snapshot = redoStack[redoStack.length - 1];
      const newRedo = redoStack.slice(0, -1);
      const newHistory = [...history, snapshot];

      setRedoStack(newRedo);
      setHistory(newHistory);
      setBackgroundSnapshot(snapshot); // Correctly sets the new background

      // Immediately restore the canvas to the new state
      restoreCanvas(snapshot);
  }
}, [history, setHistory, redoStack, setRedoStack, setBackgroundSnapshot, restoreCanvas]);


 
    
      const handleZoom = useCallback((zoomFactor) => {
        setScale(prev => prev * zoomFactor);
      }, [setScale]);
      
      
      

      const handleReset = useCallback(() => {
        if (contextRef.current && canvasRef.current) {
          // 🎨 Redraw background + grids
      
          // ✅ snapshot save karo, null na bhejo
          const snapshot = canvasRef.current.toDataURL();
          setBackgroundSnapshot(snapshot);
      
          // Reset states
          setHistory([]);
          setRedoStack([]);
          setScale(1);
          setTool("pen");
          setShowRuler(false);
          setActiveTextBox(null);
          setTextBoxes([]);
          setPivotPoint(null);
          setCurrentPoint(null);
          setIsDrawingCircle(false);
          setIsDraggingCompass(false);
          setShapes([]);
          if (typeof setCompassAngle === "function") {
            setCompassAngle(0);
          }
          setCompassPosition({ x: 100, y: 100 });
          setTextEntries([]);
        }
      }, [
        canvasRef,
        contextRef,
        setHistory,
        setRedoStack,
        setScale,
        setTool,
        setShowRuler,
        setActiveTextBox,
        setTextBoxes,
        setShapes,
        setPivotPoint,
        setCurrentPoint,
        setIsDrawingCircle,
        setIsDraggingCompass,
        setCompassAngle,
        setCompassPosition,
        setTextEntries,
        setBackgroundSnapshot
      ]);
      
    return {
        handleUndo,
        handleRedo,
        handleZoom,
        handleReset
    };
};

export default useWhiteboardActions;