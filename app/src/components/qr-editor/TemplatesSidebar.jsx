import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { qrTemplates } from './qr-templates';
import QRThumbnail from './QRThumbnail';
import { useQREditor } from './QREditorContext';

export default function TemplatesSidebar({ isOpen, onClose }) {
  const editor = useQREditor();

  const handleApply = (template) => {
    editor.applyPreset(template);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-card border-l border-border shadow-2xl z-[120] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-sidebar">
              <div>
                <h3 className="font-semibold text-lg text-white">Wszystkie szablony</h3>
                <p className="text-xs text-gray-400">Wybierz jeden z 60 gotowych motywów</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-3 gap-3">
                {qrTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleApply(template)}
                    className="group relative bg-sidebar border border-border rounded-xl p-2 flex flex-col items-center hover:border-[#009de2] hover:shadow-[0_0_15px_rgba(30,162,228,0.2)] transition-all"
                  >
                    <div 
                      className="w-full aspect-square bg-transparent rounded-lg overflow-hidden shadow-inner opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all flex items-center justify-center"
                      style={{ transform: 'translateZ(0)' }}
                    >
                      <QRThumbnail template={template} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
