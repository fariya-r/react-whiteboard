import React, { useState } from "react";
import { motion } from "framer-motion";

// Inline SVG components to replace external dependencies.
const SquareIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <rect x="64" y="128" width="384" height="256" rx="20" ry="20" />
  </svg>
);


const CircleIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z"/></svg>
);
const ArrowRightIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.7 224H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H338.7L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg>
);
const ArrowLeftIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H109.3l105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
);
const ArrowBothIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM175 208.2H337.8c9.1 0 16.2 7.1 16.2 16.2s-7.1 16.2-16.2 16.2H175c-9.1 0-16.2-7.1-16.2-16.2s7.1-16.2 16.2-16.2zM256 416a160 160 0 1 0 0-320a160 160 0 1 0 0 320z"/></svg>
);
const PlusIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>
);
const StarIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12.1 3.4 24.2 13.5 31.3s23.5 7.5 34.5 1.4l128.1-68.5 128.1 68.5c11 6.1 23.5 5.9 34.5-1.4s15.5-19.2 13.5-31.3L438.5 329 542.7 225.9c8.6-8.5 11.2-20.9 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>
);
const CompassIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="currentColor"
  >
    {/* Top handle */}
    <rect x="45" y="5" width="10" height="15" rx="2" />

    {/* Top circle */}
    <circle cx="50" cy="30" r="10" fill="currentColor" />
    <circle cx="50" cy="30" r="5" fill="white" />

    {/* Legs */}
    <path d="M50 40 L30 90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    <path d="M50 40 L70 90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />

    {/* Horizontal bar */}
    <rect x="25" y="55" width="50" height="6" rx="3" />
    
    {/* Center joint */}
    <rect x="47" y="50" width="6" height="12" rx="2" />
  </svg>
);
const ProtractorIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    {/* Outer semi-circle (bold stroke) */}
    <path d="M256 48C132 48 32 148 32 272v176h448V272C480 148 380 48 256 48zM448 416H64V272c0-106 86-192 192-192s192 86 192 192v144z" />

    {/* Inner arc cutout */}
    <path d="M128 416V272c0-70 58-128 128-128s128 58 128 128v144h-48V272c0-44-36-80-80-80s-80 36-80 80v144h-48z" />

    {/* Tick marks (bold) */}
    <rect x="96" y="352" width="32" height="32" />
    <rect x="160" y="352" width="32" height="32" />
    <rect x="224" y="352" width="32" height="32" />
    <rect x="288" y="352" width="32" height="32" />
    <rect x="352" y="352" width="32" height="32" />
  </svg>
);
const RulerIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 160"
    fill="currentColor"
  >
    {/* Ruler body (increased height from 64 → 100) */}
    <rect x="0" y="30" width="512" height="100" rx="10" ry="10" />

    {/* Tick marks */}
    <g stroke="white" strokeWidth="4">
      {/* Small ticks */}
      {Array.from({ length: 33 }).map((_, i) => (
        <line
          key={i}
          x1={i * 16}
          y1="30"
          x2={i * 16}
          y2="55"
        />
      ))}

      {/* Medium ticks */}
      {Array.from({ length: 17 }).map((_, i) => (
        <line
          key={`m-${i}`}
          x1={i * 32}
          y1="30"
          x2={i * 32}
          y2="70"
        />
      ))}

      {/* Long ticks */}
      {Array.from({ length: 9 }).map((_, i) => (
        <line
          key={`l-${i}`}
          x1={i * 64}
          y1="30"
          x2={i * 64}
          y2="95"
        />
      ))}
    </g>
  </svg>
);
const TriangleIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 32c12.3 0 24.3 4.2 33.9 12.3L480.9 220.1c16.3 14.1 22.8 35.8 17.8 56.6S480.1 320 458.6 320H53.4c-21.5 0-40.2-13.8-45.2-34.5s1.6-42.5 17.8-56.6L222.1 44.3c9.6-8.1 21.6-12.3 33.9-12.3z"/></svg>
);
const DiamondIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 0L0 256l256 256l256-256L256 0z"/></svg>
);
const HexagonIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 0L512 128v256L256 512L0 384V128L256 0z"/></svg>
);
const CylinderIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    {/* Top ellipse */}
    <ellipse cx="256" cy="96" rx="176" ry="64" />

    {/* Cylinder body (rectangle) */}
    <rect x="80" y="96" width="352" height="256" />

    {/* Bottom ellipse outline (for 3D effect) */}
    <ellipse cx="256" cy="352" rx="176" ry="64" />
  </svg>
);


const CloudIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M537.6 288.1c-15.3-25.8-28.9-52.6-42.3-79.6c-8.8-17-21-31.9-35.9-44.5c-15.5-13.4-33.1-23.7-52.2-29.9c-19-6.2-39.2-9.3-59.5-9.3c-24.3 0-48.4 5.8-71 17.5c-22.6 11.6-43.3 27.5-61.9 47.7c-18.6 20.2-34.9 44-48.8 70.8c-13.9 26.8-25.5 56.4-34.7 87.7c-9.2 31.4-15.5 64.7-18.9 98.7c-3.3 34.1-3.7 68.6-1.1 103c2.6 34.4 9.9 68.3 21.6 101.4c11.7 33.1 27.8 65 47.7 95.9c20 30.9 43.8 60 71.3 87.2c27.5 27.2 58.5 52.6 92.5 75.6c34 23 71.5 43.6 111.4 61.4c40 17.8 82.8 32.7 127.9 44.8c45.1 12.1 92.3 21.1 140.2 27.1c48.1 6 96.6 8.9 144.3 8.9c59 0 117.8-7.8 174.4-23.2c56.7-15.4 111.6-37.4 163.6-66.2c-15.3-25.8-28.9-52.6-42.3-79.6c-8.8-17-21-31.9-35.9-44.5c-15.5-13.4-33.1-23.7-52.2-29.9c-19-6.2-39.2-9.3-59.5-9.3c-24.3 0-48.4 5.8-71 17.5c-22.6 11.6-43.3 27.5-61.9 47.7c-18.6 20.2-34.9 44-48.8 70.8c-13.9 26.8-25.5 56.4-34.7 87.7c-9.2 31.4-15.5 64.7-18.9 98.7c-3.3 34.1-3.7 68.6-1.1 103c2.6 34.4 9.9 68.3 21.6 101.4c11.7 33.1 27.8 65 47.7 95.9c20 30.9 43.8 60 71.3 87.2c27.5 27.2 58.5 52.6 92.5 75.6c34 23 71.5 43.6 111.4 61.4c40 17.8 82.8 32.7 127.9 44.8c45.1 12.1 92.3 21.1 140.2 27.1c48.1 6 96.6 8.9 144.3 8.9c59 0 117.8-7.8 174.4-23.2c56.7-15.4 111.6-37.4 163.6-66.2z" /></svg>
);
const HamburgerIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/></svg>
);
const ExpandIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V240h96c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v96c0 13.3-10.7 24-24 24s-24-10.7-24-24V288H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h96V152c0-13.3 10.7-24 24-24z"/></svg>
);
const MinimizeIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    fill="currentColor"
  >
    <path d="M416 288H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h384c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/>
  </svg>
);

const ShapeRenderer = ({ shapeType, stroke }) => {
  const getShapePath = (type) => {
    switch (type) {
      case "trapezoid":
        return "M 10 0 L 40 0 L 50 50 L 0 50 Z";
      case "parallelogram":
        return "M 10 0 L 50 0 L 40 50 L 0 50 Z";
      case "octagon":
        return "M 25 0 L 45 10 L 45 40 L 25 50 L 5 40 L 5 10 Z";
      case "speechBubble":
        return "M 25 0 C 10 0 0 10 0 25 C 0 40 10 50 25 50 C 35 50 45 40 45 35 C 45 45 55 50 50 50 L 60 60 L 55 50 C 60 50 65 40 65 25 C 65 10 55 0 40 0 Z";
      default:
        return "";
    }
  };

  const viewBox = shapeType === "speechBubble" ? "0 0 65 65" : "0 0 50 50";

  return (
    <svg
      viewBox={viewBox}
      className="w-8 h-8"
      xmlns="http://www.w3.org/2000/svg"
      stroke={stroke}
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={getShapePath(shapeType)} />
    </svg>
  );
};

const TopToolbar = ({ tool, setTool, setShowRuler }) => {
  const [expanded, setExpanded] = useState(true);

  const handleShapeClick = (shape) => {
    setTool(shape);
  };

  // Base classes for a tool button
  const buttonBaseClasses = `flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200`;
  const buttonHoverClass = `hover:bg-gray-200`;
  const buttonActiveClass = `bg-blue-300`;

  const animateProps = {
    initial: { width: "100%", height: "70px", padding: "12px 16px" },
    animate: {
      width: expanded ? "100%" : "60px",
      height: expanded ? "70px" : "60px",
      padding: expanded ? "12px 16px" : "8px"
    }
  };

  return (
    <motion.div
      {...animateProps}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 bg-blue-100 text-gray-800 
                   flex items-center justify-center z-50 shadow-lg rounded-b-2xl`}
      onClick={() => !expanded && setExpanded(true)}
    >
      {expanded ? (
        <motion.div
          className="flex items-center gap-4 overflow-x-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Shapes with adjusted size and colors */}
          <button
            onClick={() => handleShapeClick("rectangle")}
            title="Rectangle"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "rectangle" ? buttonActiveClass : ""}`}
          >
            <SquareIcon className="w-8 h-8 text-blue-700" />
          </button>

          <button
            onClick={() => handleShapeClick("circle")}
            title="Circle"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "circle" ? buttonActiveClass : ""}`}
          >
            <CircleIcon className="w-8 h-8 text-red-700" />
          </button>

          <button
            onClick={() => handleShapeClick("triangle")}
            title="Triangle"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "triangle" ? buttonActiveClass : ""}`}
          >
            <TriangleIcon className="w-8 h-8 text-green-700" />
          </button>

          <button
            onClick={() => handleShapeClick("diamond")}
            title="Diamond"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "diamond" ? buttonActiveClass : ""}`}
          >
            <DiamondIcon className="w-8 h-8 text-purple-700" />
          </button>

          <button
            onClick={() => handleShapeClick("star")}
            title="Star"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "star" ? buttonActiveClass : ""}`}
          >
            <StarIcon className="w-8 h-8 text-yellow-700" />
          </button>

          <button
            onClick={() => handleShapeClick("arrow-right")}
            title="Arrow Right"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "arrow-right" ? buttonActiveClass : ""}`}
          >
            <ArrowRightIcon className="w-8 h-8 text-pink-700" />
          </button>

          <button
            onClick={() => handleShapeClick("arrow-left")}
            title="Arrow Left"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "arrow-left" ? buttonActiveClass : ""}`}
          >
            <ArrowLeftIcon className="w-8 h-8 text-pink-700" />
          </button>

          <button
            onClick={() => handleShapeClick("arrow-both")}
            title="Arrow Both"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "arrow-both" ? buttonActiveClass : ""}`}
          >
            <ArrowBothIcon className="w-8 h-8 text-indigo-700" />
          </button>

          <button
            onClick={() => handleShapeClick("hexagon")}
            title="Hexagon"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "hexagon" ? buttonActiveClass : ""}`}
          >
            <HexagonIcon className="w-8 h-8 text-teal-700" />
          </button>

          <button
            onClick={() => handleShapeClick("cylinder")}
            title="Cylinder"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "cylinder" ? buttonActiveClass : ""}`}
          >
            <CylinderIcon className="w-8 h-8 text-gray-700" />
          </button>

          {/* Updated Curly Bracket buttons */}
          <button
            onClick={() => handleShapeClick("brace-left")}
            title="Left Brace"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "brace-left" ? buttonActiveClass : ""}`}
          >
            <div className="text-4xl font-bold text-orange-700">{"{"}</div>
          </button>
          
          <button
            onClick={() => handleShapeClick("brace-right")}
            title="Right Brace"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "brace-right" ? buttonActiveClass : ""}`}
          >
            <div className="text-4xl font-bold text-orange-700">{"}"}</div>
          </button>

          <button
            onClick={() => handleShapeClick("cloud")}
            title="Cloud"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "cloud" ? buttonActiveClass : ""}`}
          >
            <CloudIcon className="w-8 h-8 text-sky-700" />
          </button>
          
          <button
            onClick={() => handleShapeClick("plus")}
            title="Plus"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "plus" ? buttonActiveClass : ""}`}
          >
            <PlusIcon className="w-8 h-8 text-green-700" />
          </button>
          
          {/* Custom Rendered Shapes */}
          <button
            onClick={() => handleShapeClick("trapezoid")}
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "trapezoid" ? buttonActiveClass : ""}`}
          >
            <ShapeRenderer shapeType="trapezoid" stroke="black" />
          </button>

          <button
            onClick={() => handleShapeClick("parallelogram")}
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "parallelogram" ? buttonActiveClass : ""}`}
          >
            <ShapeRenderer shapeType="parallelogram" stroke="black" />
          </button>

          <button
            onClick={() => handleShapeClick("octagon")}
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "octagon" ? buttonActiveClass : ""}`}
          >
            <ShapeRenderer shapeType="octagon" stroke="black" />
          </button>

          <button
            onClick={() => handleShapeClick("speechBubble")}
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "speechBubble" ? buttonActiveClass : ""}`}
          >
            <ShapeRenderer shapeType="speechBubble" stroke="black" />
          </button>

          {/* Other tools */}
          <button
            onClick={() => setTool("compass")}
            title="Compass"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "compass" ? buttonActiveClass : ""}`}
          >
            <CompassIcon className="w-8 h-8 text-orange-700" />
          </button>

          <button
            onClick={() => setTool("protractor")}
            title="Protractor"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "protractor" ? buttonActiveClass : ""}`}
          >
            <ProtractorIcon className="w-8 h-8 text-lime-700" />
          </button>

          <button
            onClick={() => setShowRuler(true)}
            title="Ruler"
            className={`${buttonBaseClasses} ${buttonHoverClass}`}
          >
            <RulerIcon className="w-8 h-8 text-cyan-700" />
          </button>

          {/* New menu icon from the image */}
          <button
            onClick={() => handleShapeClick("hamburger")}
            title="Hamburger Menu"
            className={`${buttonBaseClasses} ${buttonHoverClass} ${tool === "hamburger" ? buttonActiveClass : ""}`}
          >
            <HamburgerIcon className="w-8 h-8 text-gray-700" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
            title="Minimize"
            className="p-2 ml-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 flex-shrink-0"
          >
            <MinimizeIcon className="w-6 h-6" />
          </button>
        </motion.div>
      ) : (
        <button
          className="w-12 h-12 flex items-center justify-center p-2 rounded-lg bg-blue-700 hover:bg-blue-800 transition-colors duration-200"
          title="Expand Toolbar"
          onClick={() => setExpanded(true)}
        >
          <ExpandIcon className="w-6 h-6" />
        </button>
      )}
    </motion.div>
  );
};

export default TopToolbar;
