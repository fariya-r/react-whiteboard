import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FaEraser, FaPencilAlt, FaUndo, FaRedo, FaPlus, FaTextHeight, FaMinus, FaShareAlt, FaCompass, FaFileMedical, FaHandPaper } from 'react-icons/fa';
import { saveWhiteboard, getWhiteboards, uploadFile, updateWhiteboard, deleteWhiteboard } from '../services/whiteboardService';
import Tesseract from 'tesseract.js';
import useWhiteboardActions from '../hooks/useWhiteboardActions';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import CanvasRecorder from '../components/CanvasRecorder';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db } from '../firebase/firebase';
import RulerTool from '../components/RulerTool';
import SidePanel from './SidePanel';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { addDoc, collection } from 'firebase/firestore';
import { v4 as uuid } from 'uuid';
import useWhiteboardSocket from '../hooks/useWhiteboardSocket';
import useBoardLoader from '../hooks/useBoardLoader';
import { doc, getDoc, onSnapshot, updateDoc, setDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import WhiteboardTextLayer from '../components/WhiteboardTextLayer';
import WhiteboardToolbar from '../components/WhiteboardToolbar';
import useCanvasDrawing from '../hooks/useCanvasDrawing';
import StickyNote from './StickyNote';
import useCanvasSnapshot from '../hooks/useCanvasSnapshot';
import Shape from '../components/Shape';

const WhiteboardActivity = () => {
    const canvasRef = useRef(null);
    const [board, setBoard] = useState(null);
    const contextRef = useRef(null);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [selectedBoardId, setSelectedBoardId] = useState(null);
    const [userId, setUserId] = useState([]);
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
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [showRuler, setShowRuler] = useState(false);
    const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
    const [rulerPosition, setRulerPosition] = useState({ x: 50, y: 50 });
    const [isDraggingRuler, setIsDraggingRuler] = useState(false);
    const [isLessonWindowMinimized, setIsLessonWindowMinimized] = useState(false);
    const [canvasWidth, setCanvasWidth] = useState(800);
    const [canvasHeight, setCanvasHeight] = useState(600);
    const fullWhiteboardWidth = canvasWidth * scale;
    const fullWhiteboardHeight = canvasHeight * scale;
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
    const [compassPosition, setCompassPosition] = useState({ x: 100, y: 100 });
    const [isDraggingCompass, setIsDraggingCompass] = useState(false);
    const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
    const [compassAngle, setCompassAngle] = useState(0);
    const [isDrawingCircle, setIsDrawingCircle] = useState(false);
    const [pivotPoint, setPivotPoint] = useState(null);
    const [currentPoint, setCurrentPoint] = useState(null);
    const [isShapesMenuOpen, setIsShapesMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [whiteboardId, setWhiteboardId] = useState(null);
    const [circles, setCircles] = useState([]);

    useEffect(() => {
        const load = async () => {
            if (!whiteboardId) return;
            const whiteboards = await getWhiteboards();
            const wb = whiteboards.find(wb => wb.id === whiteboardId);
            if (wb?.shapes) setShapes(wb.shapes);
            setLoading(false);
        };
        load();
    }, [whiteboardId]);

    const handleShapeClick = (selectedShape) => {
        setTool(selectedShape); // should be 'rectangle', 'circle', 'line', or 'arrow'
        setIsShapesMenuOpen(false);
    };

    const handleCanvasClick = (e) => {
        if (!['rectangle', 'circle', 'line', 'arrow'].includes(tool)) return;
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;


        const newShape = {
            id: uuidv4(),
            type: tool,
            x: x - 50, // center the shape at click
            y: y - 50, // center the shape at click
            width: 100,
            height: 100,
            color: "lightblue",
            text: "",
            rotation: 0, // rotation angle in degrees
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
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setResolved(true);
            if (!currentUser) {
                alert('Please log in to access whiteboards.');
            }
        });
        return () => unsubscribe();
    }, [auth]);




    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.backgroundColor = backgroundColor;
        }
    }, [backgroundColor]);
    const {
        tool, setTool,
        color, setColor,
        lineWidth, setLineWidth,
        isDrawing, setIsDrawing,
        stickyNotes, setStickyNotes,
        startDrawing, drawLine, finishDrawing, handleMouseDown, getScaledCoordinates, drawShapePreview,
        handleUpdateStickyNoteSize

    } = useCanvasDrawing(
        canvasRef,
        contextRef,
        scale,
        sessionId,
        socket,
        backgroundSnapshot, // Pass the state variable here
        setBackgroundSnapshot,
        compassPosition,
        setCompassPosition,
        isDraggingCompass,
        setIsDraggingCompass,
        dragStartOffset,
        setDragStartOffset,
        compassAngle,
        setCompassAngle,
        isDrawingCircle,
        setIsDrawingCircle,
        pivotPoint,
        setPivotPoint,
        currentPoint,
        setCurrentPoint
    );

    const handleScroll = (e) => {
        setScrollPosition({
            x: e.target.scrollLeft,
            y: e.target.scrollTop,
        });
    };


    const { getSnapshotWithElements } = useCanvasSnapshot(
        canvasRef, contextRef, backgroundSnapshot, textBoxes, stickyNotes
    );
    const { handleUndo, handleRedo, handleZoom, handleReset } = useWhiteboardActions(
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
    );
    const { isAdminView, teacherUid } = useBoardLoader(
        board,
        setBoard,
        resolved,
        user,
        setMediaFiles,
        auth
    );

    const handleUpdateStickyNoteText = useCallback((id, newText) => {
        setStickyNotes(prevNotes =>
            prevNotes.map(note =>
                note.id === id ? { ...note, text: newText } : note
            )
        );
    }, [setStickyNotes]);
    const handleUpdateStickyNotePosition = useCallback((id, newPosition) => {
        setStickyNotes(prevNotes =>
            prevNotes.map(note =>
                note.id === id ? { ...note, x: newPosition.x, y: newPosition.y } : note
            )
        );
    }, [setStickyNotes]);
    useWhiteboardSocket(
        sessionId,
        navigate,
        canvasRef,
        contextRef,
        socket,
        setSocket,
        setBackgroundSnapshot,
        setTextBoxes,
        setCircles,
        setLines
    );

    const textBoxesRef = useRef([]);
    textBoxesRef.current = textBoxes;

    const togglePanel = () => {
        setIsPanelOpen(prev => !prev);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const handleTouchStart = (e) => {
            if (e.target === canvas) {
                e.preventDefault();
            }
        };
        const handleTouchMove = (e) => {
            if (e.target === canvas) {
                e.preventDefault();
            }
        };
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        return () => {
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    useEffect(() => {
        if (canvasRef.current) {
            contextRef.current = canvasRef.current.getContext('2d');
            canvasRef.current.width = 3000;
            canvasRef.current.height = 3000;
            contextRef.current.lineCap = 'round';
            contextRef.current.lineJoin = 'round';
        }
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [activeTextBox?.text]);

    // ✅ FIXED: yeh hook ab `useCanvasDrawing` se milne wale color aur lineWidth ko use kar raha hai
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = lineWidth;
        }
    }, [color, lineWidth, contextRef]);

    const loadBoard = useCallback((boardToLoad) => {
        if (!canvasRef.current || !contextRef.current) {
            console.warn('Canvas or context is not available yet. Skipping board load.');
            return;
        }
        const img = new Image();
        img.src = boardToLoad.snapshot;
        img.onload = () => {
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            contextRef.current.drawImage(img, 0, 0);
            setTextBoxes(Array.isArray(boardToLoad.textBoxes) ? boardToLoad.textBoxes : []);
            setCircles(Array.isArray(boardToLoad.circles) ? boardToLoad.circles : []);
            setStickyNotes(Array.isArray(boardToLoad.stickyNotes) ? boardToLoad.stickyNotes : []); // ✅ ADDED: Load sticky notes
            if (boardToLoad.ocrText) {
                setExtractedTextState(boardToLoad.ocrText);
            } else {
                setExtractedTextState("");
            }
            if (boardToLoad.backgroundColor) {
                setBackgroundColor(boardToLoad.backgroundColor);
            } else {
                // Default color agar save nahi hua ho
                setBackgroundColor('#ffffff');
            }
            setCurrentBoardId(boardToLoad.id);
            setSelectedBoardId(boardToLoad.id);
            setBackgroundSnapshot(boardToLoad.snapshot);
            setShowSavedBoards(false);
            setShapes(Array.isArray(boardToLoad.shapes) ? boardToLoad.shapes : []);
        };
        img.onerror = (e) => {
            console.error("Error loading board snapshot image in loadBoard:", e);
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            contextRef.current.fillStyle = boardToLoad.backgroundColor || "#ffffff";
            contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        };

    }, [canvasRef, contextRef, setTextBoxes, setCircles, setExtractedTextState, setCurrentBoardId, setSelectedBoardId, setBackgroundSnapshot, setShowSavedBoards, setStickyNotes, setBackgroundColor]); // ✅ UPDATED DEPENDENCY ARRAY


    useEffect(() => {
        if (board && resolved && canvasRef.current) {
            loadBoard(board);
        }
    }, [board, resolved, loadBoard, canvasRef]);

    const handleNewWhiteboard = () => {
        const userConfirmation = window.confirm("Are you sure you want to start a new whiteboard? All unsaved changes will be lost.");
        if (userConfirmation) {
            handleReset();
            setCurrentBoardId(null);
            setSelectedBoardId(null);
            alert('New whiteboard started. Click Save to create it.');
        }
    };

    const drawTextBoxesOnCanvas = async () => {
        const ctx = contextRef.current;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (backgroundSnapshot) {
            const img = new Image();
            img.src = backgroundSnapshot;
            await new Promise(resolve => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    resolve();
                };
            });
        }
    };

    const getWhiteboardSnapshot = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Clear and set background
        ctx.fillStyle = backgroundColor || "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ✅ Redraw shapes
        shapes.forEach(shape => {
            ctx.strokeStyle = shape.color;
            ctx.lineWidth = shape.lineWidth;

            if (shape.type === "rectangle") {
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                ctx.beginPath();
                ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (shape.type === "line") {
                ctx.beginPath();
                ctx.moveTo(shape.x1, shape.y1);
                ctx.lineTo(shape.x2, shape.y2);
                ctx.stroke();
            } else if (shape.type === "arrow") {
                ctx.beginPath();
                ctx.moveTo(shape.x1, shape.y1);
                ctx.lineTo(shape.x2, shape.y2);
                ctx.stroke();
                // Arrowhead
                const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
                ctx.lineTo(
                    shape.x2 - 10 * Math.cos(angle - Math.PI / 6),
                    shape.y2 - 10 * Math.sin(angle - Math.PI / 6)
                );
                ctx.moveTo(shape.x2, shape.y2);
                ctx.lineTo(
                    shape.x2 - 10 * Math.cos(angle + Math.PI / 6),
                    shape.y2 - 10 * Math.sin(angle + Math.PI / 6)
                );
                ctx.stroke();
            }
        });

        // ✅ Redraw textBoxes
        textBoxes.forEach(tb => {
            ctx.fillStyle = tb.color || "black";
            ctx.font = `${tb.fontSize || 16}px Arial`;
            ctx.fillText(tb.text, tb.x, tb.y);
        });

        // ✅ Redraw stickyNotes
        stickyNotes.forEach(sn => {
            ctx.fillStyle = sn.color || "yellow";
            ctx.fillRect(sn.x, sn.y, sn.width, sn.height);
            ctx.fillStyle = "black";
            ctx.fillText(sn.text, sn.x + 5, sn.y + 20);
        });

        return canvas.toDataURL("image/png");
    };


    const handleSave = async () => {
        if (!user) {
            alert('Please log in to save');
            return;
        }
    
        await drawTextBoxesOnCanvas();
    
        setTimeout(async () => {
            const canvas = canvasRef.current;
            const ocrText = extractedTextState || '';
    
            // ✅ Snapshot generate (snapshot + overlay elements)
            const dataUrl = await getSnapshotWithElements(textBoxes, stickyNotes, shapes, circles);
    
            // ✅ Current background color
            const currentBackgroundColor = canvas.style.backgroundColor || "#ffffff";
    
            // ✅ Firestore update or save
            if (currentBoardId) {
                await updateWhiteboard(
                    currentBoardId,
                    dataUrl,
                    tool || "pencil",
                    color || "#000000",
                    lineWidth || 2,
                    textBoxes || [],
                    circles || [],
                    shapes || [],
                    fileUrls || [],
                    ocrText,
                    stickyNotes || [],
                    currentBackgroundColor
                );
            } else {
                const newId = await saveWhiteboard(
                    dataUrl,
                    tool || "pencil",
                    color || "#000000",
                    lineWidth || 2,
                    textBoxes || [],
                    circles || [],
                    shapes || [],
                    fileUrls || [],
                    ocrText,
                    stickyNotes || [],
                    currentBackgroundColor
                );
                setCurrentBoardId(newId);
            }
        }, 100);
    };
    

    const fetchSavedBoards = async () => {
        if (showSavedBoards) {
            setShowSavedBoards(false);
            return;
        }
        if (isAdminView && !teacherUid) {
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

    const handleExtractedText = (text) => {
        try {
            setOcrTextBoxes([...ocrTextBoxes, { text, x: 50, y: 50 }]);
            setExtractedTextState(text);
        } catch (err) {
            console.error("Error processing extracted text in WhiteboardActivity:", err);
        }
    };

    const handleTextCanvasClick = (e) => {
        const { x, y } = getScaledCoordinates(e);
        setActiveTextBox({ x, y, text: '', font: 'Arial', size: 20, color: '#000000', bold: false, italic: false, underline: false });
    };
    const handleDeleteStickyNote = useCallback((id) => {
        setStickyNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    }, [setStickyNotes]);


    return (
        <div className="flex w-screen h-screen bg-white overflow-hidden">

            {(stickyNotes || []).map(note => (
                <StickyNote
                    key={note.id}
                    note={note}
                    onUpdateText={handleUpdateStickyNoteText}
                    onUpdatePosition={handleUpdateStickyNotePosition}
                    onDelete={handleDeleteStickyNote}
                    onUpdateSize={handleUpdateStickyNoteSize} // ✅ Add this line
                />
            ))}

            {isPanelOpen && (
                <div className="w-[300px] h-full overflow-y-auto bg-white shadow-lg z-10" style={{ position: 'relative' }}>
                    <SidePanel
                        onTextExtracted={handleExtractedText}
                        ocrText={extractedTextState}
                        userId={isAdminView ? teacherUid : user?.uid}
                    />
                </div>
            )}


<div
                style={{
                    width: "100%",
                    height: "100%",
                    overflow: "scroll",
                    position: "relative",
                    background: "#f0f0f0",
                }}
                onScroll={handleScroll}
            >
                {/*
                    The canvas is now only the size of the viewport.
                    The illusion of "infinity" comes from the camera translation
                    and drawing everything based on the data model.
                */}
                <canvas
                    ref={canvasRef}
                    style={{
                        background: "white",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={isDrawing ? drawLine : undefined}
                    onMouseUp={finishDrawing}
                    onClick={(e) => {
                        if (tool === "text") handleTextCanvasClick(e);
                        else if (['rectangle', 'circle', 'line', 'arrow'].includes(tool)) handleCanvasClick(e);
                    }}
                    onTouchStart={handleMouseDown}
                    onTouchMove={isDrawing ? drawLine : undefined}
                    onTouchEnd={finishDrawing}
                    className="cursor-crosshair"
                />
    
  {/* Render shapes over canvas */}
  {shapes.map((shape) => (
    <Shape
      key={shape.id}
      shape={shape}
      onUpdate={updateShape}
      onDelete={deleteShape}
    />
  ))}
</div>

            {
                tool === 'compass' && (
                    <img
                        src="/assets/compass.png"
                        alt="Compass Tool"
                        style={{
                            position: 'absolute',
                            left: compassPosition.x * scale,
                            top: compassPosition.y * scale,
                            width: `100px`, // Use COMPASS_WIDTH if defined
                            height: `100px`, // Use COMPASS_HEIGHT if defined
                            transform: `rotate(${compassAngle}deg)`,
                            cursor: isDraggingCompass ? 'grabbing' : 'grab',
                            pointerEvents: isDraggingCompass ? 'none' : 'auto',
                        }}
                        className="z-50"
                    />
                )
            }

            <WhiteboardTextLayer
                activeTextBox={activeTextBox}
                setActiveTextBox={setActiveTextBox}
                textBoxes={textBoxes}
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

            {
                showSavedBoards && (
                    <div
                        className="absolute top-0 right-0 w-64 z-40 shadow-lg bg-blue-600 rounded-l-xl text-white flex flex-col transition-all duration-300"
                        style={{
                            height: isLessonWindowMinimized ? "48px" : "100%", // 🔹 Panel shrinks when minimized
                            overflow: "hidden"
                        }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-3 py-2 bg-blue-700">
                            <h3 className="text-lg font-bold">Saved Lessons</h3>
                            <div className="flex gap-1">
                                {/* Minimize Button */}
                                <button
                                    onClick={() => setIsLessonWindowMinimized(prev => !prev)}
                                    className="hover:bg-blue-500 px-2 py-1 rounded"
                                    title={isLessonWindowMinimized ? "Restore" : "Minimize"}
                                >
                                    {isLessonWindowMinimized ? "🔼" : "🔽"}
                                </button>
                                {/* Close Button */}
                                <button
                                    onClick={() => setShowSavedBoards(false)}
                                    className="hover:bg-red-500 px-2 py-1 rounded"
                                    title="Close"
                                >
                                    ❌
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div
                            className={`transition-all duration-300 overflow-y-auto`}
                            style={{
                                maxHeight: isLessonWindowMinimized ? "0px" : "100%",
                                padding: isLessonWindowMinimized ? "0px" : "16px",
                                opacity: isLessonWindowMinimized ? 0 : 1,
                            }}
                        >
                            {savedBoards.map((board, index) => (
                                <div key={index} className="mb-4 bg-white rounded-lg overflow-hidden shadow text-black">
                                    <img
                                        src={board.snapshot}
                                        alt={`Whiteboard ${index + 1}`}
                                        onClick={() => loadBoard(board)}
                                        className="w-full h-auto cursor-pointer rounded-t-lg"
                                    />
                                    <div className="flex justify-between items-center px-2 py-1 bg-blue-500 text-white text-xs rounded-b-lg">
                                        <span className="truncate">{board.createdAt?.toDate?.().toLocaleString() || 'Unknown'}</span>
                                        <button
                                            onClick={async () => {
                                                const confirmDelete = window.confirm('Delete this whiteboard?');
                                                if (confirmDelete) {
                                                    await deleteWhiteboard(board.id);
                                                    setSavedBoards(prev => prev.filter(b => b.id !== board.id));
                                                }
                                            }}
                                            className="hover:text-red-200"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }    {
                showRuler && (
                    <RulerTool
                        showRuler={showRuler}
                        setShowRuler={setShowRuler}
                        rulerPosition={rulerPosition}
                        setRulerPosition={setRulerPosition}
                        isDraggingRuler={isDraggingRuler}
                        setIsDraggingRuler={setIsDraggingRuler}
                        setTool={setTool}
                    />
                )
            }

            <WhiteboardToolbar
                tool={tool}
                setTool={setTool}
                color={color}
                setColor={setColor}
                lineWidth={lineWidth}
                setLineWidth={setLineWidth}
                history={history}
                redoStack={redoStack}
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
                handleShapeClick={handleShapeClick} // ✅ Pass this
                isShapesMenuOpen={isShapesMenuOpen}
                setIsShapesMenuOpen={setIsShapesMenuOpen}
            />
        </div >
    );
};
export default WhiteboardActivity;