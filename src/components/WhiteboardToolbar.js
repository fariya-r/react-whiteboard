import React, { useState } from 'react';
import ShapeRenderer from "../components/ShapeRenderer";

import {
  FaPencilAlt,
  FaEraser,
  FaUndo,
  FaRedo,
  FaPlus,
  FaPlay,
   FaRegStar, 
  FaMinus,
  FaFileMedical,
  FaTextHeight,
FaRegSquare,  FaRegCircle,
  FaStickyNote,
  FaShapes,
  FaArrowRight,
  FaSlash, FaArrowLeft, FaArrowsAltH,
  FaRulerCombined,FaCloud
} from 'react-icons/fa';
import { GiHexagonalNut } from "react-icons/gi";
import { BiCylinder, } from "react-icons/bi";
import { TbTriangle,TbHexagon,TbDiamond } from "react-icons/tb";

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
          className={`btn ${isShapesMenuOpen ||
            ["rectangle", "circle", "line", "arrow"].includes(tool)
            ? "bg-blue-200"
            : ""
            }`}
          title="Shapes"
        >
          <FaShapes />
        </button>

        {/* Shapes Menu */}
        {isShapesMenuOpen && (
          <div
            className="absolute bottom-12 left-1/2 transform -translate-x-1/3
               bg-white rounded-xl shadow-xl p-3
               grid grid-cols-4 gap-2 border border-gray-200
               min-w-[260px] z-50"
          >
            {/* Rectangle */}
            <button
  onClick={() => handleShapeClick("rectangle")}
  title="Rectangle"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 transition-colors ${tool === "rectangle" ? "bg-blue-200" : ""}`}
>
  <FaRegSquare className="w-5 h-5" /> {/* unfilled variant */}
</button>

<button
  onClick={() => handleShapeClick("circle")}
  title="Circle"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 transition-colors ${tool === "circle" ? "bg-blue-200" : ""}`}
>
  <FaRegCircle className="w-5 h-5" />
</button>

<button
  onClick={() => handleShapeClick("triangle")}
  title="Triangle"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 transition-colors ${tool === "triangle" ? "bg-blue-200" : ""}`}
>
  <TbTriangle className="w-5 h-5" />
</button>

<button
  onClick={() => handleShapeClick("diamond")}
  title="Diamond"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 ${tool === "diamond" ? "bg-blue-200" : ""}`}
>
  <TbDiamond className="w-5 h-5" />
</button>

{/* Star */}
<button
  onClick={() => handleShapeClick("star")}
  title="Star"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 ${tool === "star" ? "bg-blue-200" : ""}`}
>
  <FaRegStar className="w-5 h-5" />  {/* Unfilled */}
</button>

{/* Arrow Right */}
<button
  onClick={() => handleShapeClick("arrow-right")}
  title="Arrow Right"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 ${tool === "arrow-right" ? "bg-blue-200" : ""}`}
>
  <FaArrowRight className="w-5 h-5" />  {/* Only solid available, but simple outline-like */}
</button>

{/* Arrow Left */}
<button
  onClick={() => handleShapeClick("arrow-left")}
  title="Arrow Left"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 ${tool === "arrow-left" ? "bg-blue-200" : ""}`}
>
  <FaArrowLeft className="w-5 h-5" />
</button>

{/* Arrow Both */}
<button
  onClick={() => handleShapeClick("arrow-both")}
  title="Arrow Both"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 ${tool === "arrow-both" ? "bg-blue-200" : ""}`}
>
  <FaArrowsAltH className="w-5 h-5" />
</button>

<button
  onClick={() => handleShapeClick("hexagon")}
  title="Hexagon"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 ${tool === "hexagon" ? "bg-blue-200" : ""}`}
>
  <TbHexagon className="w-5 h-5" />
</button>


{/* Cylinder (FaDatabase has no outline, consider BiCylinder from react-icons/bi) */}
<button
  onClick={() => handleShapeClick("cylinder")}
  title="Cylinder"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 ${tool === "cylinder" ? "bg-blue-200" : ""}`}
>
  <BiCylinder className="w-5 h-5" />  {/* Cleaner outline version */}
</button>

{/* Left Brace */}
<button
  onClick={() => handleShapeClick("brace-left")}
  title="Left Brace"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 ${tool === "brace-left" ? "bg-blue-200" : ""}`}
>
  {"{"}
</button>

{/* Right Brace */}
<button
  onClick={() => handleShapeClick("brace-right")}
  title="Right Brace"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 ${tool === "brace-right" ? "bg-blue-200" : ""}`}
>
  {"}"}
</button>

<button
  onClick={() => handleShapeClick("cloud")}
  title="Cloud"
  className={`flex justify-center items-center w-11 h-11 rounded-lg hover:bg-gray-100 transition-colors ${
    tool === "cloud" ? "bg-blue-200" : ""
  }`}
>
  ☁️
</button>


<button
  onClick={() => handleShapeClick("plus")}
  title="Plus"
  className={`flex justify-center items-center w-10 h-10 rounded-lg 
      hover:bg-gray-100 ${tool === "plus" ? "bg-blue-200" : ""}`}
>
  <FaPlus className="w-5 h-5" /> {/* Plus is already outline-like */}
</button>

{/* Trapezoid */}
<button
  onClick={() => handleShapeClick("trapezoid")}
  title="Trapezoid"
  className={`flex justify-center items-center w-11 h-11 rounded-lg 
      hover:bg-gray-100 transition-colors ${tool === "trapezoid" ? "bg-blue-200" : ""}`}
>
  <div className="w-6 h-6"> 
    <ShapeRenderer shapeType="trapezoid" color="#E3ECDD" stroke="black" strokeWidth={2} />
  </div>
</button>

{/* Parallelogram */}
<button
  onClick={() => handleShapeClick("parallelogram")}
  title="Parallelogram"
  className={`flex justify-center items-center w-11 h-11 rounded-lg 
      hover:bg-gray-100 transition-colors ${tool === "parallelogram" ? "bg-blue-200" : ""}`}
>
  <div className="w-6 h-6"> 
    <ShapeRenderer shapeType="parallelogram" color="#E3ECDD" stroke="black" strokeWidth={2} />
  </div>
</button>

{/* Octagon */}
<button
  onClick={() => handleShapeClick("octagon")}
  title="Octagon"
  className={`flex justify-center items-center w-11 h-11 rounded-lg 
      hover:bg-gray-100 transition-colors ${tool === "octagon" ? "bg-blue-200" : ""}`}
>
  <div className="w-6 h-6"> 
    <ShapeRenderer shapeType="octagon" color="#E3ECDD" stroke="black" strokeWidth={2} />
  </div>
</button>

{/* Speech Bubble */}
<button
  onClick={() => handleShapeClick("speechBubble")}
  title="Speech Bubble"
  className={`flex justify-center items-center w-11 h-11 rounded-lg 
      hover:bg-gray-100 transition-colors ${tool === "speechBubble" ? "bg-blue-200" : ""}`}
>
  <div className="w-7 h-7"> 
    <ShapeRenderer shapeType="speechBubble" color="#E3ECDD" stroke="black" strokeWidth={2} />
  </div>
</button>

{/* Hamburger */}
<button
  onClick={() => handleShapeClick("hamburger")}
  title="Hamburger"
  className={`flex justify-center items-center w-11 h-11 rounded-lg 
      hover:bg-gray-100 transition-colors ${tool === "hamburger" ? "bg-blue-200" : ""}`}
>
  <div className="w-6 h-6"> 
    <ShapeRenderer shapeType="hamburger" color="#E3ECDD" stroke="black" strokeWidth={2} />
  </div>
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