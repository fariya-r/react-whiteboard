import React, { useState } from 'react';
import { FaRulerCombined, FaRuler, FaCompass, FaDraftingCompass } from 'react-icons/fa';
import Compass from './Compass';
const MeasurementToolsMenu = ({ tool, setTool, setShowRuler }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // const handleRulerClick = () => {
  //   setShowRuler(true);
  //   setTool('line');   // ruler works with line tool
  //   setIsMenuOpen(false);
  // };

  

  // return (
  //   // <div className="relative">
     
  //   //   {isMenuOpen && (
  //   //     <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex space-x-2 border border-gray-200">
  //   //       {/* ✅ Ruler */}
  //   //       {/* <button
  //   //         onClick={handleRulerClick}
  //   //         className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${tool === 'line' && 'bg-blue-200'}`}
  //   //         title="Ruler"
  //   //       >
  //   //         <FaRuler />
  //   //       </button> */}

         
         
  //   //     </div>
  //   //   )}
  //   // </div>
  // );
};

export default MeasurementToolsMenu;
