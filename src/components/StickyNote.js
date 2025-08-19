// src/components/StickyNote.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';

const MIN_WIDTH = 100;
const MIN_HEIGHT = 60;

const StickyNote = React.memo(({ note, onUpdateText, onUpdatePosition, onUpdateSize, onDelete }) => {
  const [isEditing, setIsEditing] = useState(note.text === '');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const textareaRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const [tempPosition, setTempPosition] = useState({ x: note.x, y: note.y });
  const [tempSize, setTempSize] = useState({
    width: note.width || 150,
    height: note.height || 100
  });

  useEffect(() => {
    // Sync position from props to internal state
    setTempPosition({ x: note.x, y: note.y });
  }, [note.x, note.y]);

  useEffect(() => {
    // Sync size from props to internal state
    setTempSize({
      width: note.width || 150,
      height: note.height || 100
    });
  }, [note.width, note.height]);

  const handleTextChange = (e) => {
    if (onUpdateText) onUpdateText(note.id, e.target.value);
  };

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  // --- Drag (move) handlers ---
  const handleMouseDown = useCallback((e) => {
    if (isEditing || isResizing || e.target.dataset.resizable) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - tempPosition.x,
      y: e.clientY - tempPosition.y
    };
    e.stopPropagation();
    e.preventDefault();
  }, [isEditing, isResizing, tempPosition.x, tempPosition.y]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      setTempPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      const newWidth = Math.max(MIN_WIDTH, resizeStartRef.current.width + deltaX);
      const newHeight = Math.max(MIN_HEIGHT, resizeStartRef.current.height + deltaY);
      setTempSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      if (onUpdatePosition) onUpdatePosition(note.id, tempPosition);
    }
    if (isResizing) {
      if (onUpdateSize) onUpdateSize(note.id, { width: tempSize.width, height: tempSize.height });
    }
    setIsDragging(false);
    setIsResizing(false);
  }, [isDragging, isResizing, onUpdatePosition, onUpdateSize, note.id, tempPosition, tempSize]);

  // --- Resize handlers (bottom-right corner) ---
  const handleResizeMouseDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();

    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: tempSize.width,
      height: tempSize.height
    };
  }, [tempSize.width, tempSize.height]);

  const handleDeleteClick = useCallback((e) => {
    e.stopPropagation();
    if (onDelete) onDelete(note.id);
  }, [onDelete, note.id]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Clean up event listeners
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Handle auto-focusing the textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className="group absolute p-2 rounded-lg shadow-md border border-gray-300 transition-shadow duration-200 ease-in-out hover:shadow-lg"
      style={{
        left: `${tempPosition.x}px`,
        top: `${tempPosition.y}px`,
        backgroundColor: note.color,
        width: `${tempSize.width}px`,
        height: `${tempSize.height}px`,
        minWidth: `${MIN_WIDTH}px`,
        minHeight: `${MIN_HEIGHT}px`,
        cursor: isEditing ? 'auto' : (isDragging ? 'grabbing' : 'grab'),
        zIndex: isDragging || isResizing ? 20 : 10,
        boxSizing: 'border-box',
        userSelect: isEditing ? 'text' : 'none',
        overflow: 'hidden',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <button
        className="absolute top-1 right-1 text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={handleDeleteClick}
        title="Delete note"
      >
        <FaTimes />
      </button>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="w-full h-full bg-transparent resize-none focus:outline-none"
          value={note.text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            paddingRight: '18px'
          }}
        />
      ) : (
        <p className="whitespace-pre-wrap break-words" style={{ margin: 0 }}>
          {note.text || 'Double-click to edit'}
        </p>
      )}

      {/* Resize handle (bottom-right) */}
      <div
        data-resizable="true"
        onMouseDown={handleResizeMouseDown}
        title="Drag to resize"
        style={{
          position: 'absolute',
          right: 4,
          bottom: 4,
          width: 14,
          height: 14,
          cursor: 'se-resize',
          zIndex: 30,
          opacity: 0.7,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 10 10" style={{ display: 'block' }}>
          <path d="M0 10 L10 0 L10 3 L3 10 Z" fill="rgba(0,0,0,0.15)" />
        </svg>
      </div>
    </div>
  );
});

export default StickyNote;