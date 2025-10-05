import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RightAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 2); // only 2 steps: logo fade → full screen
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full lg:w-1/2 rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#010141" }}
    >
      <div className="text-white flex flex-col items-center justify-center w-full h-full">
        <AnimatePresence mode="wait">
          {/* STEP 0 → Small logo fade in/out */}
          {step === 0 && (
  <motion.img
    key="small-logo"
    src="assets/logo.png"
    alt="Logo"
    className="w-60 h-60"   // 🔥 bigger size (was w-24 h-24)
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.5 }}
    transition={{ duration: 1 }}
  />
)}


          {/* STEP 1 → Full layout */}
          {step === 1 && (
            <motion.div
              key="full-layout"
              className="flex flex-col items-center w-full px-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 1 }}
            >
              {/* Top section */}
              <img src="assets/logo.png" alt="Logo" className="w-16 h-16 mb-2" />
              <h2 className="text-lg font-serif mb-10">Solutions</h2>

              {/* Middle section */}
              <p className="mb-10 text-base">Presents</p>

              {/* Main section */}
              {/* Main section */}
{/* Main section */}
<div className="flex items-center mb-12">
  <img
    src="assets/logo.png"
    alt="EBoard Logo"
    className="w-40 h-40 mr-2"   // 🔥 reduced margin (closer to text)
  />
  <span
    className="text-7xl font-bold"
    style={{ fontFamily: '"Brush Script MT", cursive' }}
  >
    Board
  </span>
</div>




              {/* Bottom section */}
             {/* Bottom section */}
<p
  className="text-xl text-center"
  style={{ fontFamily: '"Imprint MT Shadow", serif' }} // 🔥 applied here
>
  The Ultimate Solution For Educators
</p>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
