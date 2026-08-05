import React, { useRef, useState, useEffect, useCallback } from 'react';
import { saveWhiteboard, getWhiteboards, uploadFile, updateWhiteboard, deleteWhiteboard } from '../services/whiteboardService';
import useWhiteboardActions from '../hooks/useWhiteboardActions';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import RulerTool from '../components/RulerTool';
import SidePanel from './SidePanel';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import TopToolbar from "./TopToolbar";
import useWhiteboardSocket from '../hooks/useWhiteboardSocket';
import useBoardLoader from '../hooks/useBoardLoader';
import WhiteboardTextLayer, { WhiteboardTextToolbar } from '../components/WhiteboardTextLayer';
import WhiteboardToolbar from '../components/WhiteboardToolbar';
import GraphPlotter from "../components/GraphPlotter";
import useCanvasDrawing from '../hooks/useCanvasDrawing';
import use3DShapes from "../hooks/use3DShapes";
import StickyNote from './StickyNote';
import useCanvasSnapshot from '../hooks/useCanvasSnapshot';
import Shape from '../components/Shape';
import Protractor from "../components/Protractor";
import Compass from './Compass';
import { supabase } from './supabaseClient';
import HandwritingRecognizer from "../components/HandwritingRecognizer";
import { drawGridBackground } from "../utils/drawGridBackground";

const CANVAS_SIZE = 4000; 

const WhiteboardActivity = () => {
    const canvasRef = useRef(null);
    const [board, setBoard] = useState(null);
    const contextRef = useRef(null);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [selectedBoardId, setSelectedBoardId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileUrls, setFileUrls] = useState([]);
    const [ocrTextBoxes, setOcrTextBoxes] = useState([]);
    const [lines, setLines] = useState([]);
    const { sessionId } = useParams();
    const auth = getAuth();
    const [socket, setSocket] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [showRuler, setShowRuler] = useState(false);
    const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
    const [rulerPosition, setRulerPosition] = useState({ x: 50, y: 50 });
    const [isDraggingRuler, setIsDraggingRuler] = useState(false);
    const [isLessonWindowMinimized, setIsLessonWindowMinimized] = useState(false);
    const [shapes, setShapes] = useState([]);
    const [savedBoards, setSavedBoards] = useState([]);
    const [showSavedBoards, setShowSavedBoards] = useState(false);
    const [currentBoardId, setCurrentBoardId] = useState(null);
    const [user, setUser] = useState(null);
    const [activeTextBox, setActiveTextBox] = useState(null);
    const [textBoxes, setTextBoxes] = useState([]);
    const [hoveredBox, setHoveredBox] = useState(null);
    const [extractedTextState, setExtractedTextState] = useState('');
    const [backgroundSnapshot, setBackgroundSnapshot] = useState(null);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const textareaRef = useRef(null);
    const [resolved, setResolved] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [textEntries, setTextEntries] = useState([]);
    const [compassPosition, setCompassPosition] = useState({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 });
        const [isDraggingCompass, setIsDraggingCompass] = useState(false);
    const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
    const [compassAngle, setCompassAngle] = useState(0);
    const [isDrawingCircle, setIsDrawingCircle] = useState(false);
    const [pivotPoint, setPivotPoint] = useState(null);
    const [currentPoint, setCurrentPoint] = useState(null);
    const [isShapesMenuOpen, setIsShapesMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [whiteboardId, setWhiteboardId] = useState(null);
    const [protractorAngle, setProtractorAngle] = useState(0);
    const [protractorHandle, setProtractorHandle] = useState({ x: 250, y: 0 });
    const [protractorRadius, setProtractorRadius] = useState(250);
    // ✅ Protractor ka world-position — screen center ke qareeb default (world-center - radius)
    const [protractorToolPosition, setProtractorToolPosition] = useState({
        x: CANVAS_SIZE / 2 - 150,
        y: CANVAS_SIZE / 2 - 150,
    });
    const [activeTouches, setActiveTouches] = useState({});
    const [boardLabel, setBoardLabel] = useState(null);
    const { id } = useParams();
    const [rulerAngle, setRulerAngle] = useState(0);
    const [showGraphTool, setShowGraphTool] = useState(false);
    const [gridSize, setGridSize] = useState(20);
    const [gridStyle, setGridStyle] = useState('lines');
    const [enableSnap, setEnableSnap] = useState(true);
    const [backgroundColor, setBackgroundColor] = useState("#001F54");
    const [gridColor, setGridColor] = useState("#001F54");
    const threeContainerRef = useRef(null);
    const [isAnyShapeEditing, setIsAnyShapeEditing] = useState(false);
    
    // Panning States
const [panOffset, setPanOffset] = useState({
        x: -(CANVAS_SIZE / 2) + window.innerWidth / 2,
        y: -(CANVAS_SIZE / 2) + window.innerHeight / 2,
    });
        const [isPanning, setIsPanning] = useState(false);
    const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });

    const handleWheelZoom = (e) => {
        if (e.ctrlKey || e.metaKey) {
            // Agar Ctrl ke sath scroll karein toh Zoom ho
            e.preventDefault();
            const zoomDirection = e.deltaY < 0 ? 1 : -1;
            const zoomFactor = zoomDirection === 1 ? 1.05 : 0.95;

            setScale((prevScale) => {
                const newScale = Math.min(Math.max(prevScale * zoomFactor, 0.1), 5);
                const scaleRatio = newScale / prevScale;

                setPanOffset((prevOffset) => ({
                    x: e.clientX - (e.clientX - prevOffset.x) * scaleRatio,
                    y: e.clientY - (e.clientY - prevOffset.y) * scaleRatio,
                }));

                return newScale;
            });
        } else {
            // Agar normal scroll karein toh Canvas smoothly Pan (Scroll) ho
            e.preventDefault();
            setPanOffset((prevOffset) => ({
                x: prevOffset.x - e.deltaX,
                y: prevOffset.y - e.deltaY,
            }));
        }
    };
    useEffect(() => {
        const container = document.getElementById('whiteboard-root');
        if (!container) return;
        const wheelHandler = (e) => handleWheelZoom(e);
        container.addEventListener('wheel', wheelHandler, { passive: false });
        return () => container.removeEventListener('wheel', wheelHandler);
    }, [scale, panOffset]);

    
    const handlePanStart = (e) => {
        if (tool === 'hand' || e.button === 1 || e.code === "Space") {
            setIsPanning(true);
            setStartPanPos({
                x: e.clientX - panOffset.x,
                y: e.clientY - panOffset.y,
            });
        }
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (!isPanning) return;
            setPanOffset({
                x: e.clientX - startPanPos.x,
                y: e.clientY - startPanPos.y,
            });
        };

        const handleGlobalMouseUp = () => {
            if (isPanning) setIsPanning(false);
        };

        if (isPanning) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isPanning, startPanPos]);

    const snapToGrid = (x, y) => {
        if (!enableSnap || !gridSize) return { x, y };
        const gx = Math.round(x / gridSize) * gridSize;
        const gy = Math.round(y / gridSize) * gridSize;
        return { x: gx, y: gy };
    };    

    useEffect(() => {
        setGridColor(backgroundColor);
    }, [backgroundColor]);

    

    useEffect(() => {
        const fetchLesson = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "whiteboards", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const lessonData = { id: docSnap.id, ...docSnap.data() };
                    setBoard(lessonData);
                }
            } catch (err) {
                console.error("Error loading lesson:", err);
            }
        };
        fetchLesson();
    }, [id]);

   useEffect(() => {
        const load = async () => {
            if (!whiteboardId) return;
            const whiteboards = await getWhiteboards();
            const wb = whiteboards.find(wb => wb.id === whiteboardId);
            if (wb?.shapes) setShapes(wb.shapes);
            if (wb?.circles) canvasDrawing.setCircles(wb.circles);
            setLoading(false);
        };
        load();
    }, [whiteboardId]);

   
    const handleEditLabel = () => {
        const newLabel = prompt("Edit lesson tag/label:", boardLabel || "Untagged");
        if (newLabel && newLabel.trim() !== "") {
            setBoardLabel(newLabel);
            if (currentBoardId) {
                updateWhiteboard(
                    currentBoardId, backgroundSnapshot, tool || "pencil", color || "#000000",
                    lineWidth || 2, textBoxes || [], shapes || [], fileUrls || [],
                    extractedTextState || '', stickyNotes || [], backgroundColor,
                    canvasDrawing.circles || [], newLabel
                );
            }
        }
    };

    const handleShapeClick = (shape) => {
        setTool(shape);
        setShowRuler(shape === "rulerLine");
        if (shape === "graphPlotter") {
            setShowGraphTool((prev) => !prev);
        } else {
            setShowGraphTool(false);
        }
    };

    const handleCanvasClick = (e) => {
         if (tool === "rulerLine" || tool === "hand") return;

        const rect = canvasRef.current.getBoundingClientRect();
        // panOffset subtract karna zaroori hai — canvas ab khud move nahi hota
        let x = (e.clientX - rect.left - panOffset.x) / scale;
        let y = (e.clientY - rect.top - panOffset.y) / scale;

        const snapped = snapToGrid(x, y);
        x = snapped.x;
        y = snapped.y;

        const newShape = {
            id: uuidv4(),
            type: tool,
            x: x - 50,
            y: y - 50,
            width: 100,
            height: 100,
            color: "lightblue",
            text: "",
            rotation: 0,
        };

        setShapes(prev => [...prev, newShape]);
    };

    const updateShape = (updatedShape) => {
        setShapes(prev => prev.map(s => s.id === updatedShape.id ? updatedShape : s));
    };

    const deleteShape = (id) => {
        setShapes(prev => prev.filter(s => s.id !== id));
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const idToken = await firebaseUser.getIdToken();
                await supabase.auth.signInWithIdToken({ provider: 'firebase', token: idToken });
                setUser(firebaseUser);
                setUserId(firebaseUser.uid);
                setResolved(true);
            } else {
                await supabase.auth.signOut();
                setUser(null);
                setUserId(null);
            }
        });
        return () => unsubscribe();
    }, [auth]);


    const canvasDrawing = useCanvasDrawing(
        canvasRef, contextRef, scale, panOffset, sessionId, socket, backgroundSnapshot,
        setBackgroundSnapshot, compassPosition, setCompassPosition, isDraggingCompass,
        setIsDraggingCompass, dragStartOffset, setDragStartOffset, compassAngle,
        setCompassAngle, shapes, setShapes, isDrawingCircle, setIsDrawingCircle,
        pivotPoint, setPivotPoint, currentPoint, setCurrentPoint, rulerAngle,
        setRulerAngle, history, setHistory, redoStack, setRedoStack, null    
    );

    const {
        tool, setTool, color, setColor, lineWidth, setLineWidth, isDrawing, setIsDrawing,
        stickyNotes, setStickyNotes, startDrawing, drawLine, finishDrawing, handleMouseDown,
        getScaledCoordinates, handleUpdateStickyNoteSize, protractorPosition, finalizeAngle,
        drawCircleOnCanvas
    } = canvasDrawing;

    useEffect(() => {
        if (tool !== 'text' && activeTextBox) {
            if (activeTextBox.text && activeTextBox.text.trim() !== '') {
                setTextBoxes(prev => [...prev, activeTextBox]);
                if (socket) {
                    socket.emit('text-box-created', {
                        room: sessionId,
                        textBox: activeTextBox,
                    });
                }
            }
            setActiveTextBox(null);
        }
    }, [tool]);
    const { getSnapshotWithElements } = useCanvasSnapshot(
        backgroundColor, gridStyle, gridSize
    );

    const threeD = use3DShapes(
        threeContainerRef, canvasDrawing.getScaledCoordinates, getSnapshotWithElements
    );
 useEffect(() => {
        if (!user) return;
        const autoSave = async () => { await handleSave(); };
        autoSave();
    }, [canvasDrawing.circles, canvasDrawing.strokes, canvasDrawing.rulerLines, shapes]);

    useEffect(() => {
        canvasDrawing.setThreeD?.(threeD);
    }, [threeD]);

    useEffect(() => {
        if (!threeD) return;
        if (!tool || !tool.startsWith("3d-")) return;
        threeD.render3DShapes();
    }, [tool]);

    
    // ✅ Naya, sync approach: jab bhi compass/protractor select ho, position
    // usi click ke event mein (setTool se pehle/saath) calculate karo — taake
    // component pehli render se hi sahi jagah pe mount ho, "1 render peeche"
    // wala stale-position bug na aaye.
    const selectTool = useCallback((newTool) => {
        if (newTool === 'compass') {
            const centerWorldX = (window.innerWidth / 2 - panOffset.x) / scale;
            const centerWorldY = (window.innerHeight / 2 - panOffset.y) / scale;
            setCompassPosition({ x: centerWorldX - 50, y: centerWorldY - 50 });
        }
        if (newTool === 'protractor') {
            const centerWorldX = (window.innerWidth / 2 - panOffset.x) / scale;
            const centerWorldY = (window.innerHeight / 2 - panOffset.y) / scale;
            setProtractorToolPosition({ x: centerWorldX - protractorRadius - 20, y: centerWorldY - protractorRadius - 20 });
        }
        setTool(newTool);
    }, [panOffset, scale, protractorRadius, setTool]);
   const {
        handleUndo, handleRedo, handleZoom, handleReset
    } = useWhiteboardActions(
        canvasRef, contextRef,
        setScale, setTool, setShowRuler, setActiveTextBox, setTextBoxes,
        setPivotPoint, setCurrentPoint, setIsDrawingCircle,
        setIsDraggingCompass, setCompassAngle, setCompassPosition, setTextEntries,
        setShapes,
        canvasDrawing.strokes, canvasDrawing.setStrokes,
        canvasDrawing.circles, canvasDrawing.setCircles,
        canvasDrawing.rulerLines, canvasDrawing.setRulerLines,
        canvasDrawing.angles, canvasDrawing.setAngles,
        canvasDrawing.actionLog, canvasDrawing.setActionLog,
        canvasDrawing.redoActionStack, canvasDrawing.setRedoActionStack,
        canvasDrawing.renderCanvas
    );

    const { isAdminView, teacherUid } = useBoardLoader(
        board, setBoard, resolved, user, setMediaFiles, auth
    );

    const handleUpdateStickyNoteText = useCallback((id, newText) => {
        setStickyNotes(prevNotes => prevNotes.map(note => note.id === id ? { ...note, text: newText } : note));
    }, [setStickyNotes]);

    const handleUpdateStickyNotePosition = useCallback((id, newPosition) => {
        setStickyNotes(prevNotes => prevNotes.map(note => note.id === id ? { ...note, x: newPosition.x, y: newPosition.y } : note));
    }, [setStickyNotes]);

    useWhiteboardSocket(
        sessionId, navigate, canvasRef, contextRef, socket, setSocket,
        setBackgroundSnapshot, setTextBoxes, canvasDrawing.setCircles, setLines
    );

    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            contextRef.current = canvas.getContext('2d');
            contextRef.current.lineCap = 'round';
            contextRef.current.lineJoin = 'round';
            canvasDrawing.renderCanvas?.();
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [canvasDrawing.renderCanvas]);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = lineWidth;
        }
    }, [color, lineWidth, contextRef]);

    const loadBoard = useCallback((boardToLoad) => {
    if (!canvasRef.current || !contextRef.current) return;
    const canvas = canvasRef.current;
    const ctx = contextRef.current;

    // 1. Sabse pehle canvas ko mukammal clear karein taake overlapping/repeat na ho
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Background color set karein
    const bgCol = boardToLoad.backgroundColor || backgroundColor || "#001F54";
    ctx.fillStyle = bgCol;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setBackgroundColor(bgCol);

    // 3. Agar snapshot mojood hai toh usay draw karein
    if (boardToLoad.snapshot) {
        const img = new Image();
        img.src = boardToLoad.snapshot;
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            if (threeD) threeD.render3DShapes();
        };
    }

    // 4. Baaki states update karein
    setTextBoxes(Array.isArray(boardToLoad.textBoxes) ? boardToLoad.textBoxes : []);
canvasDrawing.setCircles(Array.isArray(boardToLoad.circles) ? boardToLoad.circles : []);
    setStickyNotes(Array.isArray(boardToLoad.stickyNotes) ? boardToLoad.stickyNotes : []);
    setExtractedTextState(boardToLoad.ocrText || "");
    setCurrentBoardId(boardToLoad.id);
    setSelectedBoardId(boardToLoad.id);
    setBackgroundSnapshot(boardToLoad.snapshot);
    setShowSavedBoards(false);
    setShapes(Array.isArray(boardToLoad.shapes) ? boardToLoad.shapes : []);
    setPanOffset({ x: 0, y: 0 });
    setScale(1);
}, [canvasRef, contextRef, threeD, backgroundColor, canvasDrawing]);
    useEffect(() => {
        if (!board || !resolved) return;
        if (!canvasRef.current) return;
        loadBoard(board);
    }, [board?.id, resolved]);

    const handleNewWhiteboard = () => {
        if (window.confirm("Are you sure you want to start a new whiteboard?")) {
            handleReset();
            setCurrentBoardId(null);
            setSelectedBoardId(null);
            setPanOffset({ x: 0, y: 0 });
            setScale(1);
        }
    };

    const handleSave = async () => {
        if (!user) {
            alert('Please log in to save');
            return;
        }
        const dataUrl = await getSnapshotWithElements({
            strokes: canvasDrawing.strokes || [],
            circles: canvasDrawing.circles || [],
            rulerLines: canvasDrawing.rulerLines || [],
            angles: canvasDrawing.angles || [],
            shapes: shapes || [],
            textBoxes: textBoxes || [],
            stickyNotes: stickyNotes || [],
        });
        const currentBackgroundColor = backgroundColor || "#001F54";
        const label = boardLabel || "Untitled";
        
        if (currentBoardId) {
            await updateWhiteboard(
                currentBoardId, dataUrl, tool || "pencil", color || "#000000",
                lineWidth || 2, textBoxes || [], shapes || [], fileUrls || [],
                extractedTextState || '', stickyNotes || [], currentBackgroundColor,
                canvasDrawing.circles || [], label
            );
        } else {
            const newId = await saveWhiteboard(
                dataUrl, tool || "pencil", color || "#000000",
                lineWidth || 2, textBoxes || [], shapes || [], fileUrls || [],
                extractedTextState || '', stickyNotes || [], currentBackgroundColor,
                canvasDrawing.circles || [], label
            );
            setCurrentBoardId(newId);
        }
    };

    const fetchSavedBoards = async () => {
        if (showSavedBoards) {
            setShowSavedBoards(false);
            return;
        }
        try {
            const boards = await getWhiteboards(isAdminView, teacherUid);
            setSavedBoards(boards);
            setShowSavedBoards(true);
        } catch (error) {
            console.error('Error fetching saved boards:', error);
        }
    };

    const handleTextCanvasClick = (e) => {
        const { x, y } = getScaledCoordinates(e);
        setActiveTextBox({ x, y, text: '', font: 'Arial', size: 20, color: '#000000', bold: false, italic: false, underline: false });
    };

    const handleDeleteStickyNote = useCallback((id) => {
        setStickyNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    }, [setStickyNotes]);

const canvasStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        width: `${CANVAS_SIZE}px`,
        height: `${CANVAS_SIZE}px`,
    };

    // Grid + background color — CSS ke through, canvas pixels ko chhue baghair
    const getGridBackgroundStyle = () => {
        const bgCol = backgroundColor || "#001F54";
        const scaledSize = Math.max(gridSize * scale, 2); // 2px minimum, zero pe pattern crash na ho

        if (gridStyle === 'empty') {
            return { backgroundColor: bgCol, backgroundImage: "none" };
        }

        if (gridStyle === 'dots') {
            return {
                backgroundColor: bgCol,
                backgroundImage: "radial-gradient(rgba(255,255,255,0.25) 1.5px, transparent 1.5px)",
                backgroundSize: `${scaledSize}px ${scaledSize}px`,
                backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            };
        }

        // default: 'lines'
        return {
            backgroundColor: bgCol,
            backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), " +
                "linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: `${scaledSize}px ${scaledSize}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
        };
    };

   
   return (
        <div 
            id="whiteboard-root"
            className={`w-screen h-screen overflow-hidden relative select-none ${tool === 'hand' || isPanning ? 'cursor-grab active:cursor-grabbing' : ''}`}
            style={{ ...getGridBackgroundStyle(), overscrollBehavior: "none", touchAction: "none" }}
            onMouseDown={handlePanStart}
        >
            {/* World Container - Synchronized pan and zoom for all canvas elements */}
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "transparent",
                    zIndex: 1,
                    touchAction: "none",
                    pointerEvents: tool === 'hand' ? 'none' : 'auto'
                }}
                onPointerDown={(e) => {
                    if (tool && tool.startsWith("3d-")) {
                        threeD.start3DShape(e, color, tool.replace("3d-", ""));
                    } else {
                        handleMouseDown(e);
                    }
                }}
                onPointerMove={(e) => {
                    if (tool && tool.startsWith("3d-")) {
                        threeD.update3DShape(e);
                    } else {
                        drawLine(e);
                    }
                }}
                onPointerUp={(e) => {
                    if (tool && tool.startsWith("3d-")) {
                        threeD.finish3DShape();
                    } else {
                        finishDrawing(e);
                    }
                }}
                onClick={(e) => {
                    if (tool === "text") handleTextCanvasClick(e);
                    else if (
                        [
                            'rectangle', 'circle', 'line', 'arrow', 'triangle', 'diamond', 'star',
                            'hexagon', 'cylinder', 'arrow-left', 'arrow-right', 'arrow-both',
                            'brace-left', 'brace-right', 'cloud', 'plus', 'trapezoid', 'parallelogram',
                            'octagon', 'speechBubble', 'hamburger'
                        ].includes(tool)
                    ) {
                        handleCanvasClick(e);
                    }
                }}
                className={tool === 'hand' ? '' : 'cursor-crosshair'}
            />

            {/* World Container — sirf DOM overlays (shapes, sticky notes, 3D, protractor, compass)
                ke liye. Canvas ab isse bahar hai. */}
            <div 
                className="absolute top-0 left-0 will-change-transform" 
                style={{ 
                    width: `${CANVAS_SIZE}px`, 
                    height: `${CANVAS_SIZE}px`,
                    transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0px) scale(${scale})`,
                    transformOrigin: "0 0",
                    zIndex: 5, // canvas (zIndex:1) se upar — taake shapes/stickynotes hamesha hit-test mein jeetein
                    pointerEvents: "none", // shapes/stickynotes apne khud ke pointer-events sambhalte hain
                }}
            >
                <div
                    ref={threeContainerRef}
                    id="three-container"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 2,
                        background: "transparent",
                        pointerEvents: (tool && tool.startsWith("3d-")) ? "auto" : "none"
                    }}
                />

                {shapes.map((shape) => (
                    <Shape
                        key={shape.id}
                        shape={shape}
                        onUpdate={updateShape}
                        onDelete={deleteShape}
                        onEditingChange={(isEditing) => setIsAnyShapeEditing(isEditing)}
                    />
                ))}

                {(stickyNotes || []).map(note => (
                    <StickyNote
                        key={note.id}
                        note={note}
                        onUpdateText={handleUpdateStickyNoteText}
                        onUpdatePosition={handleUpdateStickyNotePosition}
                        onDelete={handleDeleteStickyNote}
                        onUpdateSize={handleUpdateStickyNoteSize}
                    />
                ))}

                {tool === "protractor" && (
                    <div style={{ position: "absolute", top: 0, left: 0, zIndex: 50, pointerEvents: "none" }}>
                        <Protractor
                            position={protractorToolPosition}
                            onPositionChange={setProtractorToolPosition}
                            radius={protractorRadius}
                            handlePos={protractorHandle}
                            setHandlePos={setProtractorHandle}
                            angle={protractorAngle}
                            setAngle={setProtractorAngle}
                            onDrawAngle={(angleData) => {
                                // ✅ Ab protractorToolPosition hamesha up-to-date hai (drag ke sath sync),
                                // is liye har angle apni asal, current jagah par banega — na ke purani fixed jagah
                                const centerX = protractorToolPosition.x + protractorRadius + 20;
                                const centerY = protractorToolPosition.y + protractorRadius + 20;
                                finalizeAngle({
                                    ...angleData,
                                    centerX,
                                    centerY,
                                    radius: protractorRadius,
                                });
                            }}
                        />
                    </div>
                )}

                {tool === 'compass' && (
                    <Compass
                        position={compassPosition}
                        onDrawCircle={drawCircleOnCanvas}
                        onDrawComplete={({ x, y, radius }) => {
                            // ✅ Compass se draw hua circle ab permanently persistent state mein save hota hai
                            const newCircle = {
                                id: `circle-${Date.now()}`,
                                x, y, r: radius,
                                color, lineWidth,
                            };
                            canvasDrawing.setCircles(prev => [...prev, newCircle]);
                            canvasDrawing.setActionLog(prev => [...prev, { type: 'circle', id: newCircle.id }]);
                            canvasDrawing.setRedoActionStack([]);
                        }}
                    />
                )}
                <WhiteboardTextLayer
                activeTextBox={isAnyShapeEditing ? null : activeTextBox}
                setActiveTextBox={setActiveTextBox}
                textBoxes={isAnyShapeEditing ? [] : textBoxes}
                setTextBoxes={setTextBoxes}
                tool={tool}
                setTool={setTool}
                sessionId={sessionId}
                socket={socket}
                hoveredBox={hoveredBox}
                setHoveredBox={setHoveredBox}
                draggingIndex={draggingIndex}
                setDraggingIndex={setDraggingIndex}
                setDragOffset={setDragOffset}
                dragOffset={dragOffset}
            />
            </div>

            {/* Done toolbar — screen-fixed, world-container ke transform se bahar */}
            <WhiteboardTextToolbar
                activeTextBox={isAnyShapeEditing ? null : activeTextBox}
                setActiveTextBox={setActiveTextBox}
                setTextBoxes={setTextBoxes}
                sessionId={sessionId}
                socket={socket}
            />

            <TopToolbar
                tool={tool}
                setTool={selectTool}
                setShowRuler={setShowRuler}
                showRuler={showRuler}
                showGraphTool={showGraphTool}
                setShowGraphTool={setShowGraphTool}
            />

            {showGraphTool && (
                <div className="absolute top-24 left-24 z-50 bg-white shadow-lg rounded-lg p-4">
                    <GraphPlotter />
                </div>
            )}

           {isPanelOpen && (
    <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        userId={userId}
        onTextExtracted={setExtractedTextState}
    />
)}
            

            {showSavedBoards && (
                <div
                    className="absolute top-0 right-0 w-64 z-40 shadow-lg bg-blue-600 rounded-l-xl text-white flex flex-col transition-all duration-300"
                    style={{
                        height: isLessonWindowMinimized ? "48px" : "100%",
                        overflow: "hidden"
                    }}
                >
                    <div className="flex justify-between items-center px-3 py-2 bg-blue-700">
                        <h3 className="text-lg font-bold">Saved Lessons</h3>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setIsLessonWindowMinimized(prev => !prev)}
                                className="hover:bg-blue-500 px-2 py-1 rounded"
                            >
                                {isLessonWindowMinimized ? "🔼" : "🔽"}
                            </button>
                            <button
                                onClick={() => setShowSavedBoards(false)}
                                className="hover:bg-red-500 px-2 py-1 rounded"
                            >
                                ❌
                            </button>
                        </div>
                    </div>

                    <div
                        className="transition-all duration-300 overflow-y-auto"
                        style={{
                            maxHeight: isLessonWindowMinimized ? "0px" : "100%",
                            padding: isLessonWindowMinimized ? "0px" : "16px",
                            opacity: isLessonWindowMinimized ? 0 : 1,
                        }}
                    >
                        {savedBoards.map((board, index) => (
                            <div key={index} className="mb-4 bg-white rounded-lg overflow-hidden shadow text-black">
                                <div
                                    className="bg-green-500 text-white text-xs px-2 py-1 font-semibold cursor-pointer"
                                    onDoubleClick={handleEditLabel}
                                >
                                    {board.label || "Untagged"}
                                </div>
                                <img
                                    src={board.snapshot}
                                    alt={`Whiteboard ${index + 1}`}
                                    onClick={() => loadBoard(board)}
                                    className="w-full h-auto cursor-pointer"
                                />
                                <div className="flex justify-between items-center px-2 py-1 bg-blue-500 text-white text-xs">
                                    <span className="truncate">{board.createdAt?.toDate?.().toLocaleString() || 'Unknown'}</span>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Delete this whiteboard?')) {
                                                await deleteWhiteboard(board.id);
                                                setSavedBoards(prev => prev.filter(b => b.id !== board.id));
                                            }
                                        }}
                                        className="hover:text-red-200"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showRuler && (
                <RulerTool
                    showRuler={showRuler}
                    setShowRuler={setShowRuler}
                    rulerPosition={rulerPosition}
                    setRulerPosition={setRulerPosition}
                    isDraggingRuler={isDraggingRuler}
                    setIsDraggingRuler={setIsDraggingRuler}
                    setTool={setTool}
                    rulerAngle={rulerAngle}
                    setRulerAngle={setRulerAngle}
                />
            )}

            <WhiteboardToolbar
                tool={tool}
                setTool={setTool}
                color={color}
                setColor={setColor}
                lineWidth={lineWidth}
                setLineWidth={setLineWidth}
                history={canvasDrawing.actionLog}
                redoStack={canvasDrawing.redoActionStack}
                handleUndo={handleUndo}
                handleRedo={handleRedo}
                togglePanel={() => setIsPanelOpen(prev => !prev)}
                handleZoom={(factor) => setScale(prev => prev * factor)}
                handleNewWhiteboard={handleNewWhiteboard}
                sessionId={sessionId}
                setShowRuler={setShowRuler}
                handleSave={handleSave}
                fetchSavedBoards={fetchSavedBoards}
                canvasRef={canvasRef}
                setActiveTextBox={setActiveTextBox}
                handleReset={handleReset}
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                gridStyle={gridStyle}
                setGridStyle={setGridStyle}
            />
        </div>
    );
};

export default WhiteboardActivity;