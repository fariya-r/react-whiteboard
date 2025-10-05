import React from "react";

const symbols = [
  ["7","8","9","4","5","6","1","2","3","0","+","-","×","÷"],
  ["(",")",".","^","½","¼","¾","x²","√","π","e"],
  ["x","sin","cos","tan","cot","sec","csc","lim","∞","∂"],
  ["∫","Σ","⌫","SPACE","Clear","="]
];

export default function MathKeyboard({ onInsert, onBackspace, onClear }) {
  const handleClick = (sym) => {
    if (sym === "⌫") onBackspace?.();
    else if (sym === "Clear") onClear?.();
    else if (sym === "SPACE") onInsert?.(" ");
    else onInsert?.(sym);
  };

  return (
    <div className="keyboard p-2 bg-gray-100 rounded-lg shadow-md w-full max-w-full">
      {symbols.map((row, i) => (
        <div key={i} className="flex flex-wrap gap-1 mb-1 justify-start">
          {row.map((sym) => (
            <button
              key={sym}
              onClick={() => handleClick(sym)}
              className={`
                px-2 py-1 bg-white border rounded hover:bg-blue-100 transition text-sm
                ${i === 3 && sym === "SPACE" ? "flex-[5_1_0%] min-w-[200px]" : ""}
                ${i === 3 && (sym === "⌫" || sym === "Clear" || sym === "=") ? "flex-[2_1_0%] min-w-[70px]" : ""}
                ${!(i === 3 && (sym === "SPACE" || sym === "⌫" || sym === "Clear" || sym === "=")) ? "flex-1 min-w-[50px]" : ""}
              `}
            >
              {sym === "SPACE" ? "" : sym}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
