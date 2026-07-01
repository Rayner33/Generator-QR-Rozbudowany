import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { TAG_COLORS, renderTagStyle } from '../../utils/tagColors';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function TagEditModal({ tag, onClose }) {
  const [name, setName] = useState(tag.name);
  const [selectedColor, setSelectedColor] = useState(tag.color);
  const [isSaving, setIsSaving] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setIsColorPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'tags', tag.id), {
        name: name.trim(),
        color: selectedColor
      });
      onClose();
    } catch (err) {
      console.error("Error updating tag:", err);
    }
    setIsSaving(false);
  };

  const tagStyleObj = renderTagStyle(selectedColor);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4" onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
        className="bg-[#0a0a0b] border border-border rounded-2xl p-6 w-full max-w-sm flex flex-col shadow-2xl relative" onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-6">
           <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${tagStyleObj.className}`} style={tagStyleObj.style}>
             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
             <span className="text-xs font-medium">{name || 'Nazwa tagu'}</span>
           </div>
        </div>

        <div className="mb-4">
          <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block tracking-wider">Nazwa</label>
          <div className="relative">
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#18181b] border border-green-500 rounded-lg py-2.5 px-3 text-sm focus:outline-none text-white"
            />
            {name.trim() && <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-[10px] text-gray-400 font-bold uppercase mb-2 block tracking-wider">Kolor</label>
          <div className="flex flex-wrap items-center gap-2">
            {TAG_COLORS.map(color => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 backface-hidden transform-gpu bg-clip-padding ${color.bg}`}
              >
                {selectedColor === color.id && <Check size={14} className="text-black" />}
              </button>
            ))}
            
            <div className="relative ml-2">
              <button
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 backface-hidden transform-gpu bg-clip-padding relative"
                style={{
                  background: selectedColor?.startsWith('#') ? selectedColor : 'conic-gradient(#ffb3ba, #ffdfba, #ffffba, #baffc9, #bae1ff, #d2baff, #ffb3ba)',
                  boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.2)'
                }}
              >
                {selectedColor?.startsWith('#') && <Check size={14} className={['#ffffff', '#fff'].includes(selectedColor?.toLowerCase()) ? "text-black" : "text-white"} />}
              </button>

              {isColorPickerOpen && (
                <div ref={colorPickerRef} className="absolute bottom-full mb-3 right-0 z-[130] p-3 bg-[#18181b] border border-border rounded-xl shadow-xl">
                  <HexColorPicker 
                    color={selectedColor?.startsWith('#') ? selectedColor : '#ffffff'} 
                    onChange={setSelectedColor} 
                  />
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => setIsColorPickerOpen(false)}
                      className="text-xs text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      ZAMKNIJ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={!name.trim() || isSaving}
          className="w-full bg-white hover:bg-gray-200 text-black font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? 'ZAPISYWANIE...' : 'ZAPISZ'}
        </button>

      </motion.div>
      <button onClick={onClose} className="absolute bottom-10 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors">
        <X size={20} />
      </button>
    </motion.div>
  );
}
