export const shapesConfig = {
    // --- Basic shapes ---
    rectangle: {
      type: "svg",
      viewBox: "0 0 100 100",
      render: (color, stroke, strokeWidth) => (
        <rect width="100%" height="100%" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
      ),
    },
  
    circle: {
      type: "div",
      render: (color) => (
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: color }} />
      ),
    },
  
    triangle: {
      type: "svg",
      viewBox: "0 0 100 100",
      render: (color, stroke, strokeWidth) => (
        <polygon points="50,0 0,100 100,100" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
      ),
    },
  
    diamond: {
      type: "svg",
      viewBox: "0 0 100 100",
      render: (color, stroke, strokeWidth) => (
        <polygon points="50,0 100,50 50,100 0,50" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
      ),
    },
  
    star: {
      type: "svg",
      viewBox: "0 0 100 100",
      render: (color, stroke, strokeWidth) => (
        <polygon
          points="50,5 61,39 98,39 68,59 79,91 50,71 21,91 32,59 2,39 39,39"
          fill={color}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ),
    },
  
    hexagon: {
      type: "svg",
      viewBox: "0 0 100 100",
      render: (color, stroke, strokeWidth) => (
        <polygon points="25,5 75,5 98,50 75,95 25,95 2,50" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
      ),
    },
  
    cylinder: {
      type: "svg",
      viewBox: "0 0 100 100",
      render: (color, stroke, strokeWidth) => (
        <>
          <ellipse cx="50" cy="20" rx="40" ry="15" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="10" y="20" width="80" height="60" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
          <ellipse cx="50" cy="80" rx="40" ry="15" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
        </>
      ),
    },
  
    // --- Braces ---
    "brace-left": {
      type: "svg",
      viewBox: "0 0 50 100",
      render: (color) => (
        <path d="M40,5 C20,5 20,30 10,30 L10,70 C20,70 20,95 40,95" stroke={color} strokeWidth="4" fill="none" />
      ),
    },
  
    "brace-right": {
      type: "svg",
      viewBox: "0 0 50 100",
      render: (color) => (
        <path d="M10,5 C30,5 30,30 40,30 L40,70 C30,70 30,95 10,95" stroke={color} strokeWidth="4" fill="none" />
      ),
    },
  
    cloud: {
      type: "svg",
      viewBox: "0 0 100 60",
      render: (color, stroke, strokeWidth) => (
        <path
          d="M30 50 Q 25 40 35 35 Q 30 20 50 20 Q 60 10 70 20 Q 90 20 90 40 Q 100 45 90 50 Z"
          fill={color}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ),
    },
  
    plus: {
      type: "svg",
      viewBox: "0 0 100 100",
      render: (color, stroke, strokeWidth) => (
        <>
          <rect x="40" y="10" width="20" height="80" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="10" y="40" width="80" height="20" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
        </>
      ),
    },
  
    // --- Arrows & line ---
    "arrow-right": {
      type: "div",
      render: (color) => (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <div style={{ width: "calc(100% - 12px)", height: "4px", backgroundColor: color, position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: `12px solid ${color}` }} />
        </div>
      ),
    },
  
    "arrow-left": {
      type: "div",
      render: (color) => (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <div style={{ width: "calc(100% - 12px)", height: "4px", backgroundColor: color, position: "absolute", top: "50%", right: 0, transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: `12px solid ${color}` }} />
        </div>
      ),
    },
  
    "arrow-both": {
      type: "div",
      render: (color) => (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <div style={{ width: "calc(100% - 24px)", height: "4px", backgroundColor: color, position: "absolute", top: "50%", left: "12px", transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: `12px solid ${color}` }} />
          <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: `12px solid ${color}` }} />
        </div>
      ),
    },
  
    line: {
      type: "svg",
      viewBox: "0 0 100 100",
      render: (color, strokeWidth) => <line x1={0} y1={0} x2="100" y2="100" stroke={color} strokeWidth={strokeWidth} />,
    },
  
    // --- Your new shapes ---
    trapezoid: {
      type: "svg",
      viewBox: "0 0 100 100",
      render: (color, stroke, strokeWidth) => <polygon points="20,0 80,0 100,100 0,100" fill={color} stroke={stroke} strokeWidth={strokeWidth} />,
    },
  
    parallelogram: {
      type: "svg",
      viewBox: "0 0 120 100",
      render: (color, stroke, strokeWidth) => <polygon points="20,0 120,0 100,100 0,100" fill={color} stroke={stroke} strokeWidth={strokeWidth} />,
    },
  
    octagon: {
      type: "svg",
      viewBox: "0 0 100 100",
      render: (color, stroke, strokeWidth) => <polygon points="30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30" fill={color} stroke={stroke} strokeWidth={strokeWidth} />,
    },
  
    speechBubble: {
      type: "svg",
      viewBox: "0 0 120 100",
      render: (color, stroke, strokeWidth) => (
        <>
          <rect x="10" y="10" width="100" height="60" rx="15" ry="15" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
          <polygon points="40,70 60,70 50,90" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
        </>
      ),
    },
  
    hamburger: {
      type: "svg",
      viewBox: "0 0 100 100",
      render: (color, stroke, strokeWidth) => (
        <>
          <rect x="10" y="20" width="80" height="10" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="10" y="45" width="80" height="10" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="10" y="70" width="80" height="10" fill={color} stroke={stroke} strokeWidth={strokeWidth} />
        </>
      ),
    },
  };
  