import React, { useState } from 'react';
import { useQREditor } from './QREditorContext';
import PositionPad from './PositionPad';
import { Image as ImageIcon, Trash, Type, Bold, Edit2, ChevronDown } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const ColorCircle = ({ color, defaultColor, onChange, disabled }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const buttonRef = React.useRef(null);
  const timeoutRef = React.useRef(null);
  const displayColor = color || defaultColor;

  const updateRect = () => {
    if (buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect());
    }
  };

  const handleOpen = () => {
    if (disabled) return;
    updateRect();
    setShowPicker(!showPicker);
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPicker(false);
    }, 150);
  };

  return (
    <>
      <div 
        ref={buttonRef}
        onClick={handleOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`w-8 h-8 rounded-full border-2 border-border shadow-sm transition-colors shrink-0 relative ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#009de2]'}`}
        style={{ backgroundColor: displayColor }}
        title={disabled ? "Opcja niedostępna (tło gradientowe)" : "Zmień kolor"}
      />
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showPicker && !disabled && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="fixed z-[9999] bg-card border border-border p-3 rounded-xl shadow-2xl origin-bottom-left"
              style={{ 
                bottom: window.innerHeight - rect.top + 10,
                left: rect.left
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold">Wybierz kolor</span>
                <button onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <HexColorPicker color={displayColor} onChange={onChange} />
              <button 
                onClick={() => { onChange(null); setShowPicker(false); }}
                className="mt-3 w-full py-1.5 text-xs bg-sidebar border border-border rounded-md hover:bg-white/5 transition-colors text-gray-300"
              >
                Użyj domyślnego
              </button>
              {/* Niewidoczny mostek łączący okienko z przyciskiem na odległość 15px w dół */}
              <div className="absolute top-full left-0 w-full h-[20px] bg-transparent" />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default function LogoTextSection() {
  const [activeTab, setActiveTab] = useState('logo'); // 'logo' | 'text'
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [hoveredFont, setHoveredFont] = useState(null);
  const fontDropdownRef = React.useRef(null);
  const fontDropdownTimeoutRef = React.useRef(null);
  const editor = useQREditor();

  const handleFontDropdownMouseLeave = () => {
    fontDropdownTimeoutRef.current = setTimeout(() => {
      setShowFontDropdown(false);
    }, 300);
  };

  const handleFontDropdownMouseEnter = () => {
    if (fontDropdownTimeoutRef.current) {
      clearTimeout(fontDropdownTimeoutRef.current);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target)) {
        setShowFontDropdown(false);
      }
    };
    if (showFontDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFontDropdown]);

  const bgIsGradient = editor.backgroundType === 'gradient';
  const defaultBgColor = bgIsGradient ? '#ffffff' : (editor.backgroundColor || '#ffffff');
  const defaultFgColor = editor.foregroundType === 'gradient' ? '#000000' : (editor.foregroundColor || '#000000');

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => editor.setLogoImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const fonts = ['Arial', 'Helvetica', 'Times', 'Courier', 'Verdana', 'Georgia'];

  return (
    <div className="space-y-5">
      {/* Zakładki */}
      <div className="flex bg-[#18181b] p-1 rounded-lg border border-border relative">
        {['logo', 'text'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(tab);
              e.currentTarget.blur();
            }}
            className={`relative flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-200'}`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="logotext-tab"
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                initial={false}
                transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{tab === 'logo' ? 'Logo' : 'Tekst'}</span>
          </button>
        ))}
      </div>

      {activeTab === 'logo' && (
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Lewa strona: Joystick (tylko gdy jest logo) */}
          <AnimatePresence>
            {editor.logoImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 flex flex-col items-center overflow-hidden"
              >
                <div className="w-full sm:w-[160px] flex flex-col items-center">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-semibold">Pozycja</label>
                  <PositionPad position={editor.logoPos} onChange={editor.setLogoPos} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Prawa strona: Opcje logo */}
          <div className="flex-1 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {!editor.logoImage ? (
                <motion.label 
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-background hover:bg-white/5 transition-colors group"
                >
                  <div className="flex flex-col items-center justify-center pt-3 pb-3">
                    <ImageIcon className="w-8 h-8 text-gray-500 mb-2 group-hover:text-[#009de2] transition-colors" />
                    <p className="text-sm text-gray-400"><span className="font-semibold text-[#009de2]">Wgraj logo</span> (SVG, PNG, JPG)</p>
                  </div>
                  <input type="file" className="hidden" accept=".svg,.png,.jpg,.jpeg" onChange={handleLogoUpload} />
                </motion.label>
              ) : (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-2 bg-background border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-white p-1 flex items-center justify-center shrink-0">
                        <img src={editor.logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="text-xs">
                        <p className="font-medium text-gray-200">Wgrane logo</p>
                        <p className="text-green-400">Aktywne</p>
                      </div>
                    </div>
                    <button onClick={() => editor.setLogoImage(null)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md transition-colors" title="Usuń logo">
                      <Trash size={16} />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-gray-400">Wielkość</label>
                      <span className="text-xs font-mono">{editor.logoSize}%</span>
                    </div>
                    <input type="range" min="10" max="100" value={editor.logoSize} onChange={(e) => editor.setLogoSize(Number(e.target.value))} className="w-full accent-[#009de2]" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-gray-400">Kolor i grubość obrysu</label>
                      <span className="text-xs font-mono">{editor.logoStrokeWidth}px</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ColorCircle 
                        color={editor.logoStrokeColor} 
                        defaultColor={defaultBgColor} 
                        onChange={editor.setLogoStrokeColor}
                        disabled={bgIsGradient}
                      />
                      <div className="flex-1">
                        <input type="range" min="0" max="30" value={editor.logoStrokeWidth} onChange={(e) => editor.setLogoStrokeWidth(Number(e.target.value))} className="w-full accent-[#009de2]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {activeTab === 'text' && (
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Lewa strona: Joystick (tylko gdy jest tekst) */}
          <AnimatePresence>
            {editor.textValue.trim() !== '' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 flex flex-col items-center overflow-hidden"
              >
                <div className="w-full sm:w-[160px] flex flex-col items-center">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-semibold">Pozycja</label>
                  <PositionPad position={editor.textPos} onChange={editor.setTextPos} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Prawa strona: Opcje tekstu */}
          <div className="flex-1 w-full space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Edit2 size={14} className="text-gray-500" />
              </div>
              <input 
                type="text" 
                value={editor.textValue}
                onChange={(e) => editor.setTextValue(e.target.value)}
                placeholder="Twój tekst..."
                className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#009de2] transition-colors placeholder:text-gray-600"
              />
            </div>

            <AnimatePresence>
              {editor.textValue.trim() !== '' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 origin-top"
                >
                  <div className="flex gap-2 pt-1">
                    <div 
                      ref={fontDropdownRef}
                      className="relative flex-1"
                      onMouseEnter={handleFontDropdownMouseEnter}
                      onMouseLeave={handleFontDropdownMouseLeave}
                    >
                      <button 
                        type="button"
                        onClick={() => setShowFontDropdown(!showFontDropdown)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none flex justify-between items-center hover:border-[#009de2] transition-colors"
                      >
                        <span style={{ fontFamily: editor.textFont }}>{editor.textFont}</span>
                        <ChevronDown size={14} className="text-gray-500" />
                      </button>
                      
                      <AnimatePresence>
                        {showFontDropdown && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-xl p-1"
                          >
                            <div className="flex flex-col gap-0.5" onMouseLeave={() => setHoveredFont(null)}>
                              {fonts.map(font => (
                                <button
                                  key={font}
                                  type="button"
                                  onMouseEnter={() => setHoveredFont(font)}
                                  onClick={() => { editor.setTextFont(font); setShowFontDropdown(false); }}
                                  className={`relative w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between group ${editor.textFont === font ? 'text-[#009de2] font-medium' : 'text-gray-200'}`}
                                  style={{ fontFamily: font }}
                                >
                                  {hoveredFont === font && (
                                    <motion.div 
                                      layoutId="font-hover"
                                      className="absolute inset-0 bg-white/5 rounded-md pointer-events-none"
                                      initial={false}
                                      transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                                    />
                                  )}
                                  <span className="relative z-10">{font}</span>
                                  {editor.textFont === font && <div className="relative z-10 w-1.5 h-1.5 rounded-full bg-[#009de2]" />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button 
                      type="button"
                      onClick={() => editor.setTextBold(!editor.textBold)}
                      className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${editor.textBold ? 'bg-[#009de2] border-[#009de2] text-white' : 'bg-background border-border text-gray-400 hover:text-white'}`}
                      title="Pogrubienie"
                    >
                      <Bold size={16} />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-gray-400">Kolor i Wielkość</label>
                      <span className="text-xs font-mono">{editor.textSize}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ColorCircle 
                        color={editor.textColor} 
                        defaultColor={defaultFgColor} 
                        onChange={editor.setTextColor}
                        disabled={false}
                      />
                      <div className="flex-1">
                        <input type="range" min="10" max="100" value={editor.textSize} onChange={(e) => editor.setTextSize(Number(e.target.value))} className="w-full accent-[#009de2]" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-gray-400">Kolor i grubość obrysu</label>
                      <span className="text-xs font-mono">{editor.textStrokeWidth}px</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ColorCircle 
                        color={editor.textStrokeColor} 
                        defaultColor={defaultBgColor} 
                        onChange={editor.setTextStrokeColor}
                        disabled={bgIsGradient}
                      />
                      <div className="flex-1">
                        <input type="range" min="0" max="30" value={editor.textStrokeWidth} onChange={(e) => editor.setTextStrokeWidth(Number(e.target.value))} className="w-full accent-[#009de2]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
