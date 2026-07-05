import React, { useState } from 'react';
import { useQREditor } from './QREditorContext';
import { qrTemplates } from './qr-templates';
import QRThumbnail from './QRThumbnail';
import TemplatesSidebar from './TemplatesSidebar';

export default function TemplatesSection() {
  const { applyPreset } = useQREditor();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Pokazujemy 5 pierwszych szablonów
  const previewTemplates = qrTemplates.slice(0, 5);

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {previewTemplates.map((template) => (
            <div 
              key={template.id}
              onClick={() => applyPreset(template)}
              className="cursor-pointer group flex flex-col items-center"
            >
              <div 
                className="w-full aspect-square rounded-xl bg-transparent overflow-hidden shadow-sm group-hover:shadow-[0_0_15px_rgba(30,162,228,0.3)] group-hover:scale-105 transition-all"
                style={{ transform: 'translateZ(0)' }}
              >
                <QRThumbnail template={template} />
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="w-full py-2.5 bg-white hover:bg-gray-200 text-black text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          Zobacz wszystkie szablony...
        </button>
      </div>

      <TemplatesSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </>
  );
}
