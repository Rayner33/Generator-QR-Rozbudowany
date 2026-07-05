import React from 'react';
import { useQREditor } from './QREditorContext';
import { motion } from 'framer-motion';

const moduleShapes = [
  { id: 'square', icon: <div className="w-3.5 h-3.5 bg-current rounded-[2px]" /> },
  { id: 'dots', icon: <div className="w-3.5 h-3.5 bg-current rounded-full" /> },
  { id: 'rounded', icon: <div className="w-3.5 h-3.5 bg-current rounded-[5px]" /> },
];

const markerOuterShapes = [
  { id: 'square', icon: <div className="w-4 h-4 border-[2.5px] border-current rounded-[3px]" /> },
  { id: 'dot', icon: <div className="w-4 h-4 border-[2.5px] border-current rounded-full" /> },
  { id: 'extra-rounded', icon: <div className="w-4 h-4 border-[2.5px] border-current rounded-[6px]" /> },
];

const markerInnerShapes = [
  { id: 'square', icon: <div className="w-3 h-3 bg-current rounded-[2px]" /> },
  { id: 'dot', icon: <div className="w-3 h-3 bg-current rounded-full" /> },
  { id: 'extra-rounded', icon: <div className="w-3 h-3 bg-current rounded-[4px]" /> },
];

const ShapeSelector = ({ shapes, selectedId, onChange, layoutIdPrefix }) => {
  return (
    <div className="flex bg-[#18181b] p-1 rounded-full border border-border relative">
      {shapes.map((shape) => (
        <button
          key={shape.id}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onChange(shape.id);
          }}
          className={`relative flex-1 py-2 flex items-center justify-center transition-colors z-10 rounded-full ${selectedId === shape.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
        >
          {selectedId === shape.id && (
            <motion.div
              layoutId={`${layoutIdPrefix}-selector`}
              className="absolute inset-0 bg-[#1ea2e4] rounded-full pointer-events-none"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-20 flex items-center justify-center">
            {shape.icon}
          </span>
        </button>
      ))}
    </div>
  );
};

export default function ShapesSection() {
  const editor = useQREditor();

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Główny kod</label>
        <ShapeSelector 
          shapes={moduleShapes} 
          selectedId={editor.moduleShape} 
          onChange={editor.setModuleShape} 
          layoutIdPrefix="moduleShape"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Zewnętrzna ramka</label>
        <ShapeSelector 
          shapes={markerOuterShapes} 
          selectedId={editor.markerOuterShape} 
          onChange={editor.setMarkerOuterShape} 
          layoutIdPrefix="markerOuterShape"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 block">Wewnętrzne oczko</label>
        <ShapeSelector 
          shapes={markerInnerShapes} 
          selectedId={editor.markerInnerShape} 
          onChange={editor.setMarkerInnerShape} 
          layoutIdPrefix="markerInnerShape"
        />
      </div>
    </div>
  );
}
