// GraphPlotter.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaCopy, FaTrash } from "react-icons/fa";

import MathKeyboard from "./MathKeyboard";
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 500;

const presets = [
  { name: "Linear (x)", expr: "x" },
  { name: "Quadratic (x^2)", expr: "x^2" },
  { name: "Sine", expr: "sin(x)" },
  { name: "Cosine", expr: "cos(x)" },
  { name: "Tangent", expr: "tan(x)" },
  { name: "Exponential (e^x)", expr: "exp(x)" },
  { name: "Natural Log (ln x)", expr: "log(x)" }, // we'll map log -> Math.log
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function safeExprToFn(expr) {
  // Convert caret to exponential operator
  const fixed = expr.replace(/\^/g, "**");
  // allow Math functions via with(Math) scope
  // NOTE: this uses dynamic function creation. For production, use mathjs
  try {
    const fn = new Function(
      "x",
      `with (Math) { return (${fixed}); }`
    );
    // test with a sample value
    fn(0);
    return fn;
  } catch (err) {
    return null;
  }
}

export default function GraphPlotter({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  initialScale = 40, // px per unit
}) {
  const [plots, setPlots] = useState([
    { id: uid(), expr: "sin(x)", color: "#ef4444", visible: true, label: "sin(x)" },
    { id: uid(), expr: "x^2 / 10", color: "#2563eb", visible: true, label: "x^2/10" },
  ]);
  const [scalePx, setScalePx] = useState(initialScale); // pixels per unit
  const [offset, setOffset] = useState({ x: width / 2, y: height / 2 }); // screen origin for (0,0)
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(null);
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null); // {x,y,screenX,screenY,plotId}
  const [exprInput, setExprInput] = useState("");
  const [unitLabel, setUnitLabel] = useState("cm"); // your requested default unit in earlier convo (but graph uses math units)
  const [errorMessage, setErrorMessage] = useState("");
  const exprInputRef = useRef(null);
  const handleBackspace = () => {
    setExprInput((prev) => prev.slice(0, -1));
  };
  
  const handleClear = () => {
    setExprInput("");
  };
  
  <input
    ref={exprInputRef}
    placeholder="Enter function f(x), e.g. sin(x), x^2, exp(x), log(x)"
    value={exprInput}
    readOnly // direct typing disable
    style={{ flex: 1, padding: 6 }}
  />
  const handleInsertSymbol = (sym) => {
    // cursor position ka support add karna optional
    setExprInput((prev) => prev + sym);
  };
  useEffect(() => {
    // ensure offset center if container resized; left simple for now
  }, []);

  // coordinate conversions
  const screenToCoord = (sx, sy) => {
    const x = (sx - offset.x) / scalePx;
    const y = (offset.y - sy) / scalePx;
    return { x, y };
  };

  const coordToScreen = (x, y) => {
    const sx = offset.x + x * scalePx;
    const sy = offset.y - y * scalePx;
    return { sx, sy };
  };

  const addPlot = (expr, color) => {
    const fn = safeExprToFn(expr);
    if (!fn) {
      setErrorMessage("Invalid expression");
      setTimeout(() => setErrorMessage(""), 2500);
      return;
    }
    setPlots((p) => [...p, { id: uid(), expr, color: color || randomColor(), visible: true, label: expr }]);
    setExprInput("");
  };

  const removePlot = (id) => setPlots((p) => p.filter((pl) => pl.id !== id));

  const togglePlot = (id) => setPlots((p) => p.map(pl => pl.id === id ? {...pl, visible: !pl.visible} : pl));

  const updatePlot = (id, patch) => setPlots((p) => p.map(pl => pl.id === id ? {...pl, ...patch} : pl));

  function randomColor() {
    const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // generate path for a plot
  const sampleAndPath = (expr, visible) => {
    const fn = safeExprToFn(expr);
    if (!fn || !visible) return null;

    const stepPx = 1; // sample every pixel horizontally
    let d = "";
    let first = true;
    // compute for screen sx from 0..width
    for (let sx = 0; sx <= width; sx += stepPx) {
      const { x } = screenToCoord(sx, 0);
      let y;
      try {
        y = fn(x);
        if (!isFinite(y) || y === null) {
          first = true;
          continue;
        }
      } catch (err) {
        first = true;
        continue;
      }
      const { sx: sx2, sy: sy2 } = coordToScreen(x, y);
      if (first) {
        d += `M ${sx2.toFixed(2)} ${sy2.toFixed(2)} `;
        first = false;
      } else {
        d += `L ${sx2.toFixed(2)} ${sy2.toFixed(2)} `;
      }
    }
    return d;
  };

  // axis ticks
  const getTicks = () => {
    // choose tick spacing in units depending on scalePx
    const pxPerUnit = scalePx;
    const approxTickPx = 80; // want ticks ~80px apart
    const unitCandidates = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50]; // units
    let unit = 1;
    for (let u of unitCandidates) {
      if (u * pxPerUnit >= approxTickPx) { unit = u; break; }
    }
    // find visible range
    const leftCoord = screenToCoord(0, 0).x;
    const rightCoord = screenToCoord(width, 0).x;
    const bottomCoord = screenToCoord(0, height).y;
    const topCoord = screenToCoord(0, 0).y;

    const xStart = Math.floor(leftCoord / unit) * unit;
    const yStart = Math.floor(bottomCoord / unit) * unit;

    const ticks = { x: [], y: [] };
    for (let xv = xStart; xv <= rightCoord; xv += unit) {
      const { sx } = coordToScreen(xv, 0);
      ticks.x.push({ value: xv, sx });
    }
    for (let yv = yStart; yv <= topCoord; yv += unit) {
      const { sy } = coordToScreen(0, yv);
      ticks.y.push({ value: yv, sy });
    }
    return ticks;
  };

  // Mouse handlers: pan & hover
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
  };

  const onMouseMove = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    const sx = e.clientX - (rect?.left || 0);
    const sy = e.clientY - (rect?.top || 0);

    if (isPanning && panStart.current) {
      const dx = e.clientX - panStart.current.sx;
      const dy = e.clientY - panStart.current.sy;
      setOffset({ x: panStart.current.ox + dx, y: panStart.current.oy + dy });
      return;
    }

    // hover: find nearest plot point
    const coord = screenToCoord(sx, sy);
    // sample each plot at this x coordinate
    let nearest = null;
    let minDist = Infinity;
    plots.forEach(pl => {
      if (!pl.visible) return;
      const fn = safeExprToFn(pl.expr);
      if (!fn) return;
      try {
        const yv = fn(coord.x);
        if (!isFinite(yv)) return;
        const { sx: sx2, sy: sy2 } = coordToScreen(coord.x, yv);
        const d = Math.hypot(sx2 - sx, sy2 - sy);
        if (d < minDist && d < 30) {
          minDist = d;
          nearest = { plotId: pl.id, x: coord.x, y: yv, screenX: sx2, screenY: sy2, label: pl.label };
        }
      } catch (err) {
        // ignore
      }
    });
    setHover(nearest);
  };

  const onMouseUp = (e) => {
    setIsPanning(false);
    panStart.current = null;
  };

  const onWheel = (e) => {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    // zoom to mouse position
    const delta = -e.deltaY; // positive when zoom in (wheel up)
    const zoomFactor = delta > 0 ? 1.08 : 1 / 1.08;
    const newScale = Math.max(8, Math.min(300, scalePx * zoomFactor));

    // keep cursor anchored: compute coord under mouse before and after, adjust offset
    const before = screenToCoord(sx, sy);
    setScalePx(newScale);
    // need to update offset after scale change (use newScale local)
    const afterScreenX = offset.x + before.x * newScale;
    const afterScreenY = offset.y - before.y * newScale;
    const ox = offset.x + (sx - afterScreenX);
    const oy = offset.y + (sy - afterScreenY);
    setOffset({ x: ox, y: oy });
  };

  // Export SVG as image (PNG)
  const exportPNG = async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      // white background
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const png = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = png;
      a.download = "graph.png";
      a.click();
    };
    img.src = url;
  };

  const copySVGString = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    navigator.clipboard?.writeText(svgString).then(() => {
      alert("SVG copied to clipboard (you can embed it).");
    });
  };

  // render
  const ticks = getTicks();

  return (
    <div style={{ userSelect: "none", width: width }}>
    {/* Top Controls */}
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "12px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* Expression Input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "6px 10px",
          background: "#f9fafb",
          flex: 1,
        }}
      >
        <input
          placeholder="Enter function f(x), e.g. sin(x), x^2, exp(x), log(x)"
          value={exprInput}
          onChange={(e) => setExprInput(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "14px",
          }}
        />
        <button
          onClick={() => addPlot(exprInput)}
          style={{
            marginLeft: "8px",
            background: "linear-gradient(to right, #3b82f6, #2563eb)",
            color: "#fff",
            padding: "6px 14px",
            borderRadius: "6px",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>


      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          background: "#f9fafb",
          padding: "6px 10px",
        }}
      >
        <select
          onChange={(e) => {
            const idx = e.target.selectedIndex - 1;
            if (idx >= 0) addPlot(presets[idx].expr);
          }}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "14px",
            outline: "none",
          }}
        >
          <option>Presets...</option>
          {presets.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </select>
      </div>
      <button
        onClick={exportPNG}
        style={{
          background: "linear-gradient(to right, #10b981, #059669)",
          color: "#fff",
          padding: "6px 14px",
          borderRadius: "6px",
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Save
      </button>        
      <button
        onClick={copySVGString}
        style={{
          background: "linear-gradient(to right, #f59e0b, #d97706)",
          color: "#fff",
          padding: "6px 14px",
          borderRadius: "6px",
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <FaCopy /> Copy
      </button>
        {errorMessage && <span style={{ color: "red" }}>{errorMessage}</span>}
      </div>
      <div style={{ marginTop: 8 }}>
  <MathKeyboard 
    onInsert={handleInsertSymbol} 
    onBackspace={handleBackspace} 
    onClear={handleClear} 
  />
</div>


      <div
        style={{
          width,
          height,
          border: "1px solid #ddd",
          position: "relative",
          background: "#fff",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { setIsPanning(false); panStart.current = null; setHover(null); }}
        onWheel={onWheel}
      >
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: "block" }}
        >
         <defs>
  <pattern id="grid" width={20} height={20} patternUnits="userSpaceOnUse">
    <rect x="0" y="0" width="1" height="1" fill="#ccc" />
    <rect x="0" y="0" width="20" height="20" fill="transparent" />
  </pattern>
</defs>
<rect x="0" y="0" width={width} height={height} fill="url(#grid)" />


          {/* axes */}
          <line
            x1={0}
            y1={offset.y}
            x2={width}
            y2={offset.y}
            stroke="#333"
            strokeWidth={1.2}
          />
          <line
            x1={offset.x}
            y1={0}
            x2={offset.x}
            y2={height}
            stroke="#333"
            strokeWidth={1.2}
          />

          {/* axis ticks and labels */}
          {ticks.x.map((t, i) => (
            <g key={"xt" + i}>
              <line x1={t.sx} y1={offset.y - 6} x2={t.sx} y2={offset.y + 6} stroke="#333" strokeWidth={1} />
              <text x={t.sx} y={offset.y + 18} fontSize="10" textAnchor="middle" fill="#333">
                {Number(t.value.toFixed(2))}
              </text>
            </g>
          ))}
          {ticks.y.map((t, i) => (
            <g key={"yt" + i}>
              <line x1={offset.x - 6} y1={t.sy} x2={offset.x + 6} y2={t.sy} stroke="#333" strokeWidth={1} />
              <text x={offset.x + 12} y={t.sy + 4} fontSize="10" fill="#333">
                {Number(t.value.toFixed(2))}
              </text>
            </g>
          ))}

          {/* plots */}
          {plots.map((pl) => {
            const d = sampleAndPath(pl.expr, pl.visible);
            return (
              pl.visible && d ? (
                <path key={pl.id} d={d} fill="none" stroke={pl.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              ) : null
            );
          })}

          {/* legend */}
          <g transform={`translate(10,10)`}>
            {plots.map((pl, i) => (
              <g key={"leg" + pl.id} transform={`translate(0, ${i * 18})`}>
                <rect x={0} y={-10} width={14} height={8} fill={pl.color} />
                <text x={20} y={0} fontSize="12" fill="#111">{pl.label}</text>
              </g>
            ))}
          </g>

          {/* hover point marker */}
          {hover && (
            <g>
              <circle cx={hover.screenX} cy={hover.screenY} r={4} fill="#111" />
              <rect x={hover.screenX + 8} y={hover.screenY - 28} width={130} height={48} rx={4} fill="rgba(0,0,0,0.75)" />
              <text x={hover.screenX + 12} y={hover.screenY - 12} fontSize="11" fill="#fff">
                {`x: ${Number(hover.x.toFixed(3))}`}
              </text>
              <text x={hover.screenX + 12} y={hover.screenY + 6} fontSize="11" fill="#fff">
                {`y: ${Number(hover.y.toFixed(3))}`}
              </text>
            </g>
          )}
        </svg>

        {/* small controls panel (colors, toggle, remove) */}
        <div style={{ position: "absolute", right: 8, top: 8, background: "rgba(255,255,255,0.9)", padding: 8, borderRadius: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Plots</div>
          {plots.map(pl => (
            <div key={"ctl"+pl.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
              <input type="checkbox" checked={pl.visible} onChange={() => togglePlot(pl.id)} />
              <input value={pl.label} onChange={(e)=> updatePlot(pl.id, { label: e.target.value })} style={{ width: 110 }} />
              <input type="color" value={pl.color} onChange={(e)=> updatePlot(pl.id, { color: e.target.value })} />
              <button
            onClick={() => removePlot(pl.id)}
            style={{
              border: "none",
              background: "transparent",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            <FaTrash />
          </button>            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
