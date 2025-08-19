import React, { useState } from 'react';
import {
  FaPencilAlt,
  FaEraser,
  FaUndo,
  FaRedo,
  FaPlus,
  FaMinus,
  FaFileMedical,
  FaTextHeight,
  FaSquare,
  FaCircle,
  FaStickyNote,
  FaShapes,
  FaArrowRight,
  FaSlash,
  FaRulerCombined,
} from 'react-icons/fa';
import ShareButton from './ShareButton';
import CanvasRecorder from './CanvasRecorder';
import MeasurementToolsMenu from './MeasurementToolsMenu';

const WhiteboardToolbar = ({
  tool, setTool, color, setColor, lineWidth, setLineWidth, history, redoStack,
  handleUndo, handleRedo, togglePanel, handleZoom, handleNewWhiteboard, sessionId,
  setShowRuler, handleSave, fetchSavedBoards, canvasRef, setActiveTextBox, handleReset,
  // Add new props for background color
  backgroundColor, setBackgroundColor 
}) => {
  const [isShapesMenuOpen, setIsShapesMenuOpen] = useState(false);

  const handleShapeClick = (shapeTool) => {
    setTool(shapeTool);
    setIsShapesMenuOpen(false);
  };
  
  return (
    <div className="fixed bottom-0 w-full bg-white p-2 shadow-inner flex justify-around items-center z-50">
      <button onClick={() => setTool('pen')} title="Pen" className={`btn ${tool === 'pen' ? 'bg-blue-200' : ''}`}>
        <FaPencilAlt />
      </button>
      <button onClick={() => setTool('eraser')} title="Eraser" className={`btn ${tool === 'eraser' ? 'bg-blue-200' : ''}`}>
        <FaEraser />
      </button>

      <div className="relative">
      {/* Shapes Menu Toggle Button */}
      <button
        onClick={() => setIsShapesMenuOpen(prev => !prev)}
        className={`btn ${
          isShapesMenuOpen || ["rectangle", "circle", "line", "arrow"].includes(tool)
            ? "bg-blue-200"
            : ""
        }`}
        title="Shapes"
      >
        <FaShapes />
      </button>

      {/* Shapes Menu */}
      {isShapesMenuOpen && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex space-x-2 border border-gray-200">
          <button
            onClick={() => handleShapeClick("rectangle")}
            title="Rectangle"
            className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${
              tool === "rectangle" ? "bg-blue-200" : ""
            }`}
          >
            <FaSquare />
          </button>
          <button
            onClick={() => handleShapeClick("circle")}
            title="Circle"
            className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${
              tool === "circle" ? "bg-blue-200" : ""
            }`}
          >
            <FaCircle />
          </button>
          <button
            onClick={() => handleShapeClick("line")}
            title="Line"
            className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${
              tool === "line" ? "bg-blue-200" : ""
            }`}
          >
            <FaSlash />
          </button>
          <button
            onClick={() => handleShapeClick("arrow")}
            title="Arrow"
            className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${
              tool === "arrow" ? "bg-blue-200" : ""
            }`}
          >
            <FaArrowRight />
          </button>
        </div>
      )}
    </div>

      <button onClick={() => setTool('stickyNote')} title="Sticky Note" className={`btn ${tool === 'stickyNote' ? 'bg-blue-200' : ''}`}>
        <FaStickyNote />
      </button>

      <input type="color" value={color} onChange={e => setColor(e.target.value)} title="Select Color" className="w-8 h-8 cursor-pointer" />
      <input
        type="range"
        min="1"
        max="30"
        value={lineWidth}
        onChange={e => setLineWidth(Number(e.target.value))}
        title="Line Width"
        className="w-24"
      />
      <button onClick={handleUndo} className="btn" disabled={history.length <= 1} title="Undo">
        <FaUndo />
      </button>
      <button onClick={handleRedo} className="btn" disabled={redoStack.length === 0} title="Redo">
        <FaRedo />
      </button>
      <button onClick={togglePanel}>📎</button>
      <button onClick={() => handleZoom(1.2)} className="btn" title="Zoom In">
        <FaPlus />
      </button>
      <button onClick={() => handleZoom(0.8)} className="btn" title="Zoom Out">
        <FaMinus />
      </button>
      <button onClick={handleNewWhiteboard} className="btn" title="New Whiteboard">
        <FaFileMedical />
      </button>
      <ShareButton sessionId={sessionId} />

      <MeasurementToolsMenu
        tool={tool}
        setTool={setTool}
        setShowRuler={setShowRuler}
      />

      <button onClick={handleSave}>💾 Save</button>
      <button onClick={fetchSavedBoards}>📂 All Lessons</button>
      <CanvasRecorder canvasRef={canvasRef} />
      <button
        onClick={() => {
          if (tool === 'text') {
            setTool(null);
            setActiveTextBox(null);
          } else {
            setTool('text');
          }
        }}
        className={`btn ${tool === 'text' ? 'bg-blue-200' : ''}`}
        title="Text Tool"
      >
        <FaTextHeight />
      </button>
      <label htmlFor="bg-color-picker" className="flex items-center space-x-2 cursor-pointer">
        <span>🎨 BG Color</span>
        <input 
          id="bg-color-picker"
          type="color" 
          value={backgroundColor} 
          onChange={e => setBackgroundColor(e.target.value)} 
          title="Select Background Color" 
          className="w-8 h-8 cursor-pointer"
        />
      </label>
      <button onClick={handleReset} className="bg-red-500 text-white px-3 py-1 rounded">Reset</button>
    </div>
  );
};

export default WhiteboardToolbar;