// src/hooks/useWhiteboardActions.js
import { useCallback } from 'react';

// Undo/Redo ab image-snapshots pe nahi, `actionLog` (chronological list of
// {type, id}) aur respective vector arrays (strokes/circles/rulerLines/angles)
// pe kaam karta hai. Ye zaroori tha kyunke canvas ab pixels ki jagah data se
// bharta hai (unbounded infinite canvas ke liye).
const useWhiteboardActions = (
    canvasRef,
    contextRef,
    setScale,
    setTool,
    setShowRuler,
    setActiveTextBox,
    setTextBoxes,
    setPivotPoint,
    setCurrentPoint,
    setIsDrawingCircle,
    setIsDraggingCompass,
    setCompassAngle,
    setCompassPosition,
    setTextEntries,
    setShapes,
    // Naye params — vector data + undo log:
    strokes, setStrokes,
    circles, setCircles,
    rulerLines, setRulerLines,
    angles, setAngles,
    actionLog, setActionLog,
    redoActionStack, setRedoActionStack,
    renderCanvas
) => {

    const getArrayForType = useCallback((type) => {
        switch (type) {
            case 'stroke': return [strokes, setStrokes];
            case 'circle': return [circles, setCircles];
            case 'rulerLine': return [rulerLines, setRulerLines];
            case 'angle': return [angles, setAngles];
            default: return [null, null];
        }
    }, [strokes, setStrokes, circles, setCircles, rulerLines, setRulerLines, angles, setAngles]);

    const handleUndo = useCallback(() => {
        if (!actionLog || actionLog.length === 0) return;

        const last = actionLog[actionLog.length - 1];
        const [arr, setArr] = getArrayForType(last.type);
        if (!arr || !setArr) return;

        const element = arr.find(el => el.id === last.id);
        if (!element) {
            // already missing, sirf log se hata do
            setActionLog(prev => prev.slice(0, -1));
            return;
        }

        setArr(prev => prev.filter(el => el.id !== last.id));
        setActionLog(prev => prev.slice(0, -1));
        setRedoActionStack(prev => [...prev, { type: last.type, id: last.id, element }]);

        if (renderCanvas) setTimeout(renderCanvas, 0);
    }, [actionLog, getArrayForType, setActionLog, setRedoActionStack, renderCanvas]);

    const handleRedo = useCallback(() => {
        if (!redoActionStack || redoActionStack.length === 0) return;

        const last = redoActionStack[redoActionStack.length - 1];
        const [, setArr] = getArrayForType(last.type);
        if (!setArr) return;

        setArr(prev => [...prev, last.element]);
        setRedoActionStack(prev => prev.slice(0, -1));
        setActionLog(prev => [...prev, { type: last.type, id: last.id }]);

        if (renderCanvas) setTimeout(renderCanvas, 0);
    }, [redoActionStack, getArrayForType, setActionLog, setRedoActionStack, renderCanvas]);

    const handleZoom = useCallback((zoomFactor) => {
        setScale(prev => prev * zoomFactor);
    }, [setScale]);

    const handleReset = useCallback(() => {
        // ✅ Sab vector data clear karo
        setStrokes([]);
        setCircles([]);
        setRulerLines([]);
        setAngles([]);
        setActionLog([]);
        setRedoActionStack([]);

        // ✅ Tools & states reset
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
        setTextEntries([]);

        if (typeof setCompassAngle === "function") setCompassAngle(0);
        setCompassPosition({ x: 100, y: 100 });

        if (renderCanvas) setTimeout(renderCanvas, 0);
    }, [
        setStrokes, setCircles, setRulerLines, setAngles, setActionLog, setRedoActionStack,
        setScale, setTool, setShowRuler, setActiveTextBox, setTextBoxes,
        setPivotPoint, setCurrentPoint, setIsDrawingCircle, setIsDraggingCompass,
        setCompassAngle, setCompassPosition, setShapes, setTextEntries, renderCanvas
    ]);

    return {
        handleUndo,
        handleRedo,
        handleZoom,
        handleReset
    };
};

export default useWhiteboardActions;