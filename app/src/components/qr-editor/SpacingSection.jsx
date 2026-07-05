import React from 'react';
import { useQREditor } from './QREditorContext';

export default function SpacingSection() {
  const { padding, setPadding } = useQREditor();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-200">Padding kodu (Odstęp)</label>
        <span className="text-xs font-bold text-[#1ea2e4] bg-[#1ea2e4]/10 px-2 py-1 rounded">
          {padding}%
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <input 
          type="range" 
          min="0" 
          max="30" 
          step="1"
          value={padding}
          onChange={(e) => setPadding(Number(e.target.value))}
          className="flex-1 accent-[#1ea2e4]"
        />
      </div>
      
      <div className="mt-4 flex items-start gap-3 bg-[#1ea2e4]/10 border border-[#1ea2e4]/20 rounded-lg p-4">
        <svg className="w-5 h-5 text-[#1ea2e4] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-xs text-gray-300 leading-relaxed">
          Zwiększenie odstępu pomniejszy moduły kodu QR, tworząc bezpieczną pustą strefę (Quiet Zone) wokół. Logo i Tekst pozostaną oryginalnej wielkości!
        </p>
      </div>
    </div>
  );
}
