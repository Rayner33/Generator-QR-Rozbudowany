import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { HexColorPicker } from 'react-colorful';
import { PREDEFINED_GRADIENTS, darkenHex } from '../utils/colors';
import { getInitials } from '../utils/stringUtils';

export default function WorkspaceModal({ isOpen, onClose, currentUser, setActiveWorkspace }) {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState(PREDEFINED_GRADIENTS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setIsSaving(false);
      setAvatarStyle(PREDEFINED_GRADIENTS[Math.floor(Math.random() * PREDEFINED_GRADIENTS.length)]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSaving(true);
    
    try {
      const docRef = await addDoc(collection(db, "workspaces"), {
        name,
        ownerId: currentUser.uid,
        type: "team",
        avatarStyle,
        createdAt: serverTimestamp(),
        allowMembersEdit: false,
        allowMembersArchive: false,
        allowMembersReset: false
      });
      
      setActiveWorkspace({ 
        id: docRef.id, 
        name, 
        ownerId: currentUser.uid, 
        type: "team", 
        avatarStyle 
      });
      
      onClose();
    } catch (err) {
      console.error("Błąd zapisu:", err);
      alert("Nie udało się zapisać zespołu na serwerze. Sprawdź reguły bazy.");
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="workspace-modal"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[150] flex justify-end"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          
          {/* Panel */}
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="w-[480px] h-full bg-[#0a0a0b] border-l border-border shadow-2xl flex flex-col relative z-10"
          >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors z-10"
          >
            <X size={18} />
          </button>

          <div className="p-8 pb-4 border-b border-border">
            <h2 className="text-2xl font-bold mb-1">Utwórz zespół</h2>
            <p className="text-sm text-gray-400">Utwórz nowy workspace, aby współpracować z zespołem</p>
          </div>

        <form onSubmit={handleSubmit} className="p-8 flex-1 flex flex-col">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">Nazwa zespołu</label>
            <p className="text-xs text-gray-400 mb-4">Wybierz nazwę dla swojego workspace</p>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Mój zespół"
              className="w-full bg-card border border-border focus:border-[#f97316] rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors mb-8"
              autoFocus
            />

            {/* Avatar Preview & Selection */}
            <div className="flex items-start gap-6">
              {/* Big Avatar Preview */}
              <div 
                className="w-20 h-20 flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-border shrink-0"
                style={{ background: avatarStyle, borderRadius: '30%' }}
              >
                {getInitials(name, 'Z')}
              </div>
              
              {/* Style Selection */}
              <div>
                <p className="text-sm font-medium mb-3">Wybierz kolor awatara</p>
                <div className="flex flex-wrap gap-3 relative">
                  {PREDEFINED_GRADIENTS.map((gradient, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => { setAvatarStyle(gradient); setShowColorPicker(false); }}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 backface-hidden transform-gpu bg-clip-padding ${avatarStyle === gradient ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''}`}
                      style={{ background: gradient }}
                    />
                  ))}
                  
                  {/* Custom Color Button */}
                  <button 
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center bg-card transition-transform hover:scale-110 backface-hidden transform-gpu bg-clip-padding ${showColorPicker ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''}`}
                    title="Własny kolor"
                  >
                     <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-red-500 via-green-500 to-blue-500" />
                  </button>
                  
                  {/* Color Picker Dropdown */}
                  {showColorPicker && (
                    <div ref={colorPickerRef} className="absolute top-10 left-0 z-50 p-3 bg-card border border-border rounded-xl shadow-xl">
                       <HexColorPicker 
                         color={avatarStyle?.match(/#[0-9a-fA-F]{6}/)?.[0] || '#ffffff'} 
                         onChange={(color) => setAvatarStyle(`linear-gradient(to bottom right, ${color}, ${darkenHex(color, 60)})`)} 
                       />
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div className="mt-auto pt-6 border-t border-border">
             <button 
               type="submit"
               disabled={isSaving || !name.trim()}
               className="w-full bg-[#FF4C00] hover:bg-[#CC3D00] text-white font-semibold rounded-lg px-4 py-3 transition-colors disabled:opacity-50"
             >
               {isSaving ? 'Tworzenie...' : 'Utwórz zespół'}
             </button>
          </div>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
