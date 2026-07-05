import React from 'react';

export default function QRThumbnail({ template }) {
  const bgStyle = template.backgroundType === 'gradient'
    ? { background: `linear-gradient(${template.backgroundGradient?.rotation || 45}deg, ${template.backgroundGradient?.colorStops?.[0]?.color || '#ffffff'}, ${template.backgroundGradient?.colorStops?.[1]?.color || '#ffffff'})` }
    : { backgroundColor: template.backgroundColor || '#ffffff' };

  return (
    <div 
      className="w-full h-full flex items-center justify-center object-contain"
      style={bgStyle}
    >
      <img src={`/templates/${template.id}.svg`} alt={template.name} className="w-full h-full" loading="lazy" />
    </div>
  );
}
