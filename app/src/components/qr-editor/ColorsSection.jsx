import React, { useState } from 'react';
import { useQREditor } from './QREditorContext';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import { Pipette } from 'lucide-react';

const predefinedColors = [
  '#000000', '#434343', '#878787', '#cccccc', '#ffffff', '#f4f1e1', '#0b3d6e',
  '#3f51b5', '#2196f3', '#4fc3f7', '#26c6da', '#26a69a', '#2e7d32', '#66bb6a',
  '#9ccc65', '#cddc39', '#673ab7', '#9c27b0', '#f48fb1', '#e91e63', '#d32f2f',
  '#f44336', '#ff5722', '#ff9800', '#ffc107', '#ffeb3b', '#795548', '#78909c'
];

const predefinedGradients = [
  // Row 1
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#ffffff' }, { offset: 1, color: '#e6e6e6' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#f5f5f5' }, { offset: 1, color: '#cccccc' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#434343' }, { offset: 1, color: '#000000' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#5c6bc0' }, { offset: 1, color: '#283593' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#29b6f6' }, { offset: 1, color: '#0277bd' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#4dd0e1' }, { offset: 1, color: '#0097a7' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#455a64' }, { offset: 1, color: '#263238' }] },
  // Row 2
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#26a69a' }, { offset: 1, color: '#00695c' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#66bb6a' }, { offset: 1, color: '#2e7d32' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#aed581' }, { offset: 1, color: '#558b2f' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#d4e157' }, { offset: 1, color: '#9e9d24' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#7e57c2' }, { offset: 1, color: '#4527a0' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#ab47bc' }, { offset: 1, color: '#6a1b9a' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#f8bbd0' }, { offset: 1, color: '#ad1457' }] },
  // Row 3
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#f06292' }, { offset: 1, color: '#c2185b' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#ef5350' }, { offset: 1, color: '#c62828' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#ff7043' }, { offset: 1, color: '#d84315' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#ffca28' }, { offset: 1, color: '#f57c00' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#ffee58' }, { offset: 1, color: '#fbc02d' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#e0e0e0' }, { offset: 1, color: '#9e9e9e' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#7986cb' }, { offset: 1, color: '#283593' }] },
  // Row 4
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#ec407a' }, { offset: 1, color: '#880e4f' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#4fc3f7' }, { offset: 1, color: '#01579b' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#69f0ae' }, { offset: 1, color: '#00bfa5' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#ffab91' }, { offset: 1, color: '#bf360c' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#e0f7fa' }, { offset: 1, color: '#b2ebf2' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#fce4ec' }, { offset: 1, color: '#f8bbd0' }] },
  { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#e1f5fe' }, { offset: 1, color: '#81d4fa' }] }
];

export default function ColorsSection({ type }) {
  const editor = useQREditor();
  const [showPicker, setShowPicker] = useState(false);
  const [activeGradientStop, setActiveGradientStop] = useState(0);

  const colorPickerRef = React.useRef(null);
  const colorPickerTimeoutRef = React.useRef(null);

  const isForeground = type === 'foreground';
  
  const currentType = isForeground ? editor.foregroundType : editor.backgroundType;
  const setType = isForeground ? editor.setForegroundType : editor.setBackgroundType;
  
  const currentColor = isForeground ? editor.foregroundColor : editor.backgroundColor;
  const setColor = isForeground ? editor.setForegroundColor : editor.setBackgroundColor;

  const currentGradient = isForeground ? editor.foregroundGradient : editor.backgroundGradient;
  const setGradient = isForeground ? editor.setForegroundGradient : editor.setBackgroundGradient;

  const getGradientStyle = (grad) => {
    if (!grad) return { background: currentColor };
    if (grad.type === 'linear') {
      return { background: `linear-gradient(${grad.rotation}deg, ${grad.colorStops.map(s => s.color).join(', ')})` };
    }
    if (grad.type === 'radial') {
      return { background: `radial-gradient(circle, ${grad.colorStops.map(s => s.color).join(', ')})` };
    }
    return { background: currentColor };
  };

  const handleMouseEnter = () => {
    if (colorPickerTimeoutRef.current) {
      clearTimeout(colorPickerTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    colorPickerTimeoutRef.current = setTimeout(() => {
      setShowPicker(false);
    }, 300);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    if (showPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  return (
    <div className="space-y-4">
      {/* Zakładki */}
      <div className="flex bg-[#18181b] p-1 rounded-lg border border-border relative">
        {['solid', 'gradient'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setType(tab);
              e.currentTarget.blur();
            }}
            className={`relative flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${currentType === tab ? 'text-black' : 'text-gray-400 hover:text-gray-200'}`}
          >
            {currentType === tab && (
              <motion.div
                layoutId={`color-tab-${type}`}
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                initial={false}
                transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{tab === 'solid' ? 'Jednolity' : 'Gradient'}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-stretch items-center md:items-start">
        {/* Plansza z kolorem/gradientem */}
        <div className="relative shrink-0 w-full md:w-[200px]" ref={colorPickerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div 
            onClick={() => setShowPicker(!showPicker)}
            className={`relative w-full h-[120px] md:h-[200px] rounded-xl border-2 cursor-pointer shadow-lg transition-colors overflow-hidden group ${showPicker ? 'border-[#1ea2e4]' : 'border-border hover:border-[#1ea2e4]'}`}
            style={currentType === 'solid' ? { backgroundColor: currentColor } : getGradientStyle(currentGradient)}
          >
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-colors group-hover:bg-white/40">
              <Pipette size={16} className="text-white drop-shadow-sm" />
            </div>
          </div>

          {/* Color Picker Popover */}
          <AnimatePresence>
            {showPicker && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute z-[100] bottom-full mb-3 left-0 bg-background border border-border p-3 rounded-xl shadow-2xl w-[220px]"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-gray-200">
                    {currentType === 'solid' ? 'Kolor' : 'Edycja gradientu'}
                  </span>
                  <button onClick={() => setShowPicker(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
                </div>
                
                {currentType === 'gradient' && (
                  <div className="flex gap-2 mb-3 bg-[#18181b] p-1 rounded-lg border border-border">
                    <button
                      onClick={() => setActiveGradientStop(0)}
                      className={`flex-1 py-1 text-xs rounded-md transition-colors ${activeGradientStop === 0 ? 'bg-[#1ea2e4]/10 text-[#1ea2e4] font-medium' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                      Początkowy
                    </button>
                    <button
                      onClick={() => setActiveGradientStop(1)}
                      className={`flex-1 py-1 text-xs rounded-md transition-colors ${activeGradientStop === 1 ? 'bg-[#1ea2e4]/10 text-[#1ea2e4] font-medium' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                      Końcowy
                    </button>
                  </div>
                )}

                <HexColorPicker 
                  color={currentType === 'solid' ? currentColor : (currentGradient?.colorStops[activeGradientStop].color || '#000')} 
                  onChange={(c) => {
                    if (currentType === 'solid') {
                      setColor(c);
                    } else {
                      const newGrad = { ...currentGradient, type: 'linear', rotation: 135 };
                      newGrad.colorStops[activeGradientStop].color = c;
                      setGradient(newGrad);
                    }
                  }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Predefiniowane kolory / gradienty */}
        <div className="flex-1 w-full grid grid-cols-7 grid-rows-4 gap-1.5">
          {currentType === 'solid' ? (
            predefinedColors.map((color, i) => (
              <button
                key={i}
                onClick={() => setColor(color)}
                className={`w-full h-full aspect-square md:aspect-auto rounded-md transition-shadow focus:outline-none ${currentColor === color ? 'shadow-[inset_0_0_0_2px_#1ea2e4]' : 'shadow-none hover:shadow-[inset_0_0_0_2px_#1ea2e4]'}`}
                style={{ backgroundColor: color }}
              />
            ))
          ) : (
            predefinedGradients.map((grad, i) => (
              <button
                key={i}
                onClick={() => setGradient(grad)}
                className={`w-full h-full aspect-square md:aspect-auto rounded-md transition-shadow focus:outline-none ${currentGradient === grad ? 'shadow-[inset_0_0_0_2px_#1ea2e4]' : 'shadow-none hover:shadow-[inset_0_0_0_2px_#1ea2e4]'}`}
                style={getGradientStyle(grad)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
