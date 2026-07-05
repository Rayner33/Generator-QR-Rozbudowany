import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Palette, Type, LayoutTemplate, Layers, Square, Maximize } from 'lucide-react';
import TemplatesSection from './TemplatesSection';
import LogoTextSection from './LogoTextSection';
import ShapesSection from './ShapesSection';
import ColorsSection from './ColorsSection';
import SpacingSection from './SpacingSection';

const AccordionItem = ({ title, icon, isOpen, onClick, children }) => {
  return (
    <div className={`border border-border rounded-xl mb-3 bg-card/30 transition-all ${isOpen ? 'relative z-50 ring-1 ring-[#1ea2e4]/20 shadow-lg' : 'relative z-10'}`}>
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 bg-card hover:bg-card/80 transition-colors ${isOpen ? 'rounded-t-xl' : 'rounded-xl'}`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-gray-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.2 } }}
            exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.2 }, opacity: { duration: 0.1 } } }}
            style={{ overflow: isOpen ? 'visible' : 'hidden' }}
          >
            <div className="p-4 border-t border-border">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function DesignAccordion() {
  const [openSection, setOpenSection] = useState('templates');

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div>
      <h3 className="flex items-center gap-3 font-semibold mb-4">
        <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs">4</span>
        Zaprojektuj kod QR
      </h3>
      
      <div className="ml-9">
        <AccordionItem 
          title="Szablony" 
          icon={<LayoutTemplate size={18} className="text-gray-400" />}
          isOpen={openSection === 'templates'} 
          onClick={() => toggleSection('templates')}
        >
          <TemplatesSection />
        </AccordionItem>

        <AccordionItem 
          title="Logo i tekst" 
          icon={<Type size={18} className="text-gray-400" />}
          isOpen={openSection === 'logotext'} 
          onClick={() => toggleSection('logotext')}
        >
          <LogoTextSection />
        </AccordionItem>

        <AccordionItem 
          title="Kształt modułów i markerów" 
          icon={<Square size={18} className="text-gray-400" />}
          isOpen={openSection === 'shapes'} 
          onClick={() => toggleSection('shapes')}
        >
          <ShapesSection />
        </AccordionItem>

        <AccordionItem 
          title="Pierwszy plan" 
          icon={<Palette size={18} className="text-gray-400" />}
          isOpen={openSection === 'foreground'} 
          onClick={() => toggleSection('foreground')}
        >
          <ColorsSection type="foreground" />
        </AccordionItem>

        <AccordionItem 
          title="Tło" 
          icon={<Palette size={18} className="text-gray-400" />}
          isOpen={openSection === 'background'} 
          onClick={() => toggleSection('background')}
        >
          <ColorsSection type="background" />
        </AccordionItem>

        <AccordionItem 
          title="Odstępy" 
          icon={<Maximize size={18} className="text-gray-400" />}
          isOpen={openSection === 'spacing'} 
          onClick={() => toggleSection('spacing')}
        >
          <SpacingSection />
        </AccordionItem>
      </div>
    </div>
  );
}
