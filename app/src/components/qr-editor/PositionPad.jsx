import React, { useRef, useState, useEffect } from 'react';

export default function PositionPad({ position = { x: 50, y: 50 }, onChange }) {
  const padRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculatePosition = (clientX, clientY) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    
    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;
    
    // Ograniczenia do 0-100
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    // Snapping do środka (50%)
    if (Math.abs(x - 50) < 3) x = 50;
    if (Math.abs(y - 50) < 3) y = 50;

    onChange({ x: Math.round(x), y: Math.round(y) });
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    calculatePosition(e.clientX, e.clientY);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    calculatePosition(e.clientX, e.clientY);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  const isSnappedX = position.x === 50;
  const isSnappedY = position.y === 50;

  return (
    <div className="w-full max-w-[140px] mx-auto">
      <div 
        ref={padRef}
        className={`relative w-full aspect-square bg-[#18181b] border-2 border-border rounded-xl overflow-hidden touch-none transition-shadow ${isDragging ? 'cursor-grabbing ring-1 ring-[#009de2]/50' : 'cursor-pointer hover:border-gray-500'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Linie prowadzące (Snapping guides) */}
        <div className={`absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 transition-colors ${isSnappedX ? 'bg-[#009de2]/50' : 'bg-white/10'}`}></div>
        <div className={`absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 transition-colors ${isSnappedY ? 'bg-[#009de2]/50' : 'bg-white/10'}`}></div>
        
        {/* Wskaźnik (Joystick dot) */}
        <div 
          className="absolute w-5 h-5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out pointer-events-none"
          style={{ 
            left: `${position.x}%`, 
            top: `${position.y}%`,
            scale: isDragging ? 1.2 : 1
          }}
        >
          <div className="w-1.5 h-1.5 bg-[#009de2] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
      <div className="flex justify-between mt-2 px-1 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
        <span>X: {position.x}%</span>
        <span>Y: {position.y}%</span>
      </div>
    </div>
  );
}
