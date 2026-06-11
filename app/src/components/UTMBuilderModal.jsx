import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, Globe, Link as LinkIcon, Flag, FileText, Check } from 'lucide-react';

export default function UTMBuilderModal({ isOpen, onClose, onSave, initialUtm, type }) {
  const [utm, setUtm] = useState({
    source: initialUtm?.source || '',
    medium: initialUtm?.medium || '',
    campaign: initialUtm?.campaign || '',
    content: initialUtm?.content || ''
  });

  useEffect(() => {
    if (isOpen) {
      setUtm({
        source: initialUtm?.source || '',
        medium: initialUtm?.medium || '',
        campaign: initialUtm?.campaign || '',
        content: initialUtm?.content || ''
      });
    }
  }, [isOpen, initialUtm]);

  const handleChange = (field, value) => {
    setUtm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(utm);
  };

  // Placeholders logic
  const getPlaceholder = (field) => {
    if (field === 'source') {
      return type === 'qr' ? 'np. ulotka, plakat, etykieta' : 'np. facebook, TikTok';
    }
    if (field === 'medium') {
      return type === 'qr' ? 'qr' : 'social, email';
    }
    if (field === 'campaign') {
      return 'np. promocja_lato';
    }
    if (field === 'content') {
      return type === 'qr' ? 'np. wersja_z_logo, rozmiar_750ml' : 'np. strona_produktu, karta_charakterystyki';
    }
    return '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.2 }} 
        className="fixed inset-0 z-[110] bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm p-4 gap-6"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.95 }} 
          transition={{ type: "spring", duration: 0.4, bounce: 0.1 }} 
          className="bg-[#0a0a0b] border border-border rounded-2xl p-6 w-full max-w-[500px] flex flex-col shadow-2xl relative"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Network size={20} className="text-[#10b981]" />
              UTM Builder
            </h3>
          </div>

          <div className="space-y-4">
            <UtmInput 
              icon={<Globe size={16} />} 
              label="Source (Źródło)" 
              value={utm.source} 
              onChange={(v) => handleChange('source', v)} 
              placeholder={getPlaceholder('source')} 
              type={type}
            />
            <UtmInput 
              icon={<LinkIcon size={16} />} 
              label="Medium (Nośnik)" 
              value={utm.medium} 
              onChange={(v) => handleChange('medium', v)} 
              placeholder={getPlaceholder('medium')} 
              type={type}
            />
            <UtmInput 
              icon={<Flag size={16} />} 
              label="Campaign (Kampania)" 
              value={utm.campaign} 
              onChange={(v) => handleChange('campaign', v)} 
              placeholder={getPlaceholder('campaign')} 
              type={type}
            />
            <UtmInput 
              icon={<FileText size={16} />} 
              label="Content (Treść)" 
              value={utm.content} 
              onChange={(v) => handleChange('content', v)} 
              placeholder={getPlaceholder('content')} 
              type={type}
            />
          </div>

          <div className="mt-8">
            <button 
              onClick={handleSave}
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Zapisz UTM
            </button>
          </div>
        </motion.div>

        {/* X close button below the modal */}
        <button 
          onClick={onClose} 
          className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors shadow-lg"
        >
          <X size={24} />
        </button>
      </motion.div>
      )}
    </AnimatePresence>
  );
}

function UtmInput({ icon, label, value, onChange, placeholder, type }) {
  const isValid = value.trim().length > 0;
  
  // Różny kolor focus w zależności od miejsca (Smart Link = Fiolet, QR = Niebieski)
  const focusBorderColor = type === 'qr' ? 'focus:border-[#1ea2e4]' : 'focus:border-[#8b5cf6]';
  
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-white flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        {label}
      </label>
      <div className="relative">
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#18181b] border ${isValid ? 'border-[#10b981] focus:border-[#10b981] text-[#10b981]' : `border-border ${focusBorderColor} text-white`} rounded-lg px-4 py-2 text-sm placeholder-gray-600 focus:outline-none transition-colors pr-10`}
        />
        {isValid && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#10b981]/20 rounded flex items-center justify-center w-5 h-5">
            <Check className="w-3.5 h-3.5 text-[#10b981]" />
          </div>
        )}
      </div>
    </div>
  );
}
