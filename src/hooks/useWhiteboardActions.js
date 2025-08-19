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
    const handleUndo = () => {
        if (history.length <= 1) return;
      
        const lastState = history[history.length - 2]; // previous state
        setRedoStack(prev => [history[history.length - 1], ...prev]);
        setHistory(history.slice(0, -1));
      
        restoreState(lastState);
      };
      
      const handleRedo = () => {
        if (redoStack.length === 0) return;
      
        const nextState = redoStack[0];
        setHistory(prev => [...prev, nextState]);
        setRedoStack(redoStack.slice(1));
      
        restoreState(nextState);
      };
      
      const restoreState = (state) => {
        // restore canvas
        const img = new Image();
        img.src = state.canvasData;
        img.onload = () => {
          const ctx = contextRef.current;
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(img, 0, 0);
        };
      
        // restore interactive elements
        // setStickyNotes(state.stickyNotes || []);
        setCircles(state.circles || []);
        // setShapes(state.shapes || []);
      };
      
    const handleZoom = useCallback((zoomFactor) => {
        setScale(prev => prev * zoomFactor);
    }, [setScale]);

    const handleReset = useCallback(() => {
        if (contextRef.current && canvasRef.current) {
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setHistory([]);
            setRedoStack([]);
            setScale(1);
            setTool('pen');
            setShowRuler(false);
            setActiveTextBox(null);
            setTextBoxes([]);
            
            // Compass states ko reset karein
            setPivotPoint(null);
            setCurrentPoint(null);
            setIsDrawingCircle(false);
            setIsDraggingCompass(false);
            setShapes([]);

            // Add a check to make sure setCompassAngle is a function before calling it
            if (typeof setCompassAngle === 'function') {
                setCompassAngle(0);
            }
            
            setCompassPosition({ x: 100, y: 100 });
            
            setTextEntries([]);
            setBackgroundSnapshot(null);
        }
    }, [contextRef, canvasRef, setHistory, setRedoStack, setScale, setTool, setShowRuler, setActiveTextBox, setTextBoxes, setCircles,setShapes, setPivotPoint, setCurrentPoint, setIsDrawingCircle, setIsDraggingCompass, setCompassAngle, setCompassPosition, setTextEntries, setBackgroundSnapshot]);
    
    return {
        handleUndo,
        handleRedo,
        handleZoom,
        handleReset
    };
};

export default useWhiteboardActions;