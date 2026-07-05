export const qrTemplates = [
  // 1-5: Klasyczne i Profesjonalne
  {
    id: 'classic', name: 'Klasyczny',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#000000',
    backgroundType: 'solid', backgroundColor: '#ffffff',
    padding: 15
  },
  {
    id: 'corporate-blue', name: 'Biznesowy',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#1e3a8a',
    backgroundType: 'solid', backgroundColor: '#ffffff',
    padding: 15
  },
  {
    id: 'elegant-dark', name: 'Elegancki',
    moduleShape: 'dots', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#ffffff',
    backgroundType: 'solid', backgroundColor: '#111827',
    padding: 15
  },
  {
    id: 'minimalist-gray', name: 'Minimal',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#374151',
    backgroundType: 'solid', backgroundColor: '#f3f4f6',
    padding: 15
  },
  {
    id: 'premium-gold', name: 'Premium Gold',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#ffffff',
    backgroundType: 'solid', backgroundColor: '#b45309', // Dark gold/bronze
    padding: 15
  },

  // 6-10: Zaokrąglone i Miękkie
  {
    id: 'soft-blue', name: 'Soft Blue',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#2563eb',
    backgroundType: 'solid', backgroundColor: '#eff6ff',
    padding: 15
  },
  {
    id: 'mint-fresh', name: 'Miętowy',
    moduleShape: 'dots', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#059669',
    backgroundType: 'solid', backgroundColor: '#ecfdf5',
    padding: 15
  },
  {
    id: 'cherry-blossom', name: 'Wiśnia',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#be123c',
    backgroundType: 'solid', backgroundColor: '#fff1f2',
    padding: 15
  },
  {
    id: 'lavender', name: 'Lawenda',
    moduleShape: 'dots', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#6d28d9',
    backgroundType: 'solid', backgroundColor: '#f5f3ff',
    padding: 15
  },
  {
    id: 'sunny-yellow', name: 'Słoneczny',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#b45309',
    backgroundType: 'solid', backgroundColor: '#fef3c7',
    padding: 15
  },

  // 11-15: Kropki i Okręgi (Playful)
  {
    id: 'dotted-dark', name: 'Kropki Dark',
    moduleShape: 'dots', markerOuterShape: 'dot', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#1f2937',
    backgroundType: 'solid', backgroundColor: '#ffffff',
    padding: 15
  },
  {
    id: 'dotted-teal', name: 'Kropki Teal',
    moduleShape: 'dots', markerOuterShape: 'dot', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#0d9488',
    backgroundType: 'solid', backgroundColor: '#f0fdfa',
    padding: 15
  },
  {
    id: 'dotted-rose', name: 'Kropki Rose',
    moduleShape: 'dots', markerOuterShape: 'dot', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#e11d48',
    backgroundType: 'solid', backgroundColor: '#fff1f2',
    padding: 15
  },
  {
    id: 'dotted-indigo', name: 'Kropki Indigo',
    moduleShape: 'dots', markerOuterShape: 'dot', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#4338ca',
    backgroundType: 'solid', backgroundColor: '#e0e7ff',
    padding: 15
  },
  {
    id: 'dotted-orange', name: 'Kropki Pomarańcz',
    moduleShape: 'dots', markerOuterShape: 'dot', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#c2410c',
    backgroundType: 'solid', backgroundColor: '#fff7ed',
    padding: 15
  },

  // 16-20: Dynamiczne Gradienty (Foreground)
  {
    id: 'grad-ocean', name: 'Ocean',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#0ea5e9' }, { offset: 1, color: '#3b82f6' }] },
    backgroundType: 'solid', backgroundColor: '#ffffff', padding: 15
  },
  {
    id: 'grad-sunset', name: 'Zachód',
    moduleShape: 'dots', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#f59e0b' }, { offset: 1, color: '#ef4444' }] },
    backgroundType: 'solid', backgroundColor: '#ffffff', padding: 15
  },
  {
    id: 'grad-cyber', name: 'Cyberpunk',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#8b5cf6' }, { offset: 1, color: '#ec4899' }] },
    backgroundType: 'solid', backgroundColor: '#18181b', padding: 15
  },
  {
    id: 'grad-forest', name: 'Las',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#10b981' }, { offset: 1, color: '#047857' }] },
    backgroundType: 'solid', backgroundColor: '#ffffff', padding: 15
  },
  {
    id: 'grad-fire', name: 'Ogień',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'radial', rotation: 0, colorStops: [{ offset: 0, color: '#f97316' }, { offset: 1, color: '#b91c1c' }] },
    backgroundType: 'solid', backgroundColor: '#ffffff', padding: 15
  },

  // 21-25: Kolorowe Tła z białym kodem
  {
    id: 'bg-grad-blue', name: 'Niebieska Głębia',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#ffffff',
    backgroundType: 'gradient',
    backgroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#1e3a8a' }, { offset: 1, color: '#3b82f6' }] },
    padding: 15
  },
  {
    id: 'bg-grad-purple', name: 'Fioletowa Magia',
    moduleShape: 'dots', markerOuterShape: 'dot', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#ffffff',
    backgroundType: 'gradient',
    backgroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#4c1d95' }, { offset: 1, color: '#8b5cf6' }] },
    padding: 15
  },
  {
    id: 'bg-grad-dark', name: 'Mroczny Styl',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#ffffff',
    backgroundType: 'gradient',
    backgroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#000000' }, { offset: 1, color: '#374151' }] },
    padding: 15
  },
  {
    id: 'bg-grad-green', name: 'Wiosenny',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#ffffff',
    backgroundType: 'gradient',
    backgroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#064e3b' }, { offset: 1, color: '#10b981' }] },
    padding: 15
  },
  {
    id: 'bg-grad-red', name: 'Czerwony Aksamit',
    moduleShape: 'dots', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#ffffff',
    backgroundType: 'gradient',
    backgroundGradient: { type: 'radial', rotation: 0, colorStops: [{ offset: 0, color: '#7f1d1d' }, { offset: 1, color: '#ef4444' }] },
    padding: 15
  },

  // 26-30: Экstremalne i Nietypowe (Kreski poziome/pionowe itp.)
  {
    id: 'lines-h-black', name: 'Poziome Paski',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#000000',
    backgroundType: 'solid', backgroundColor: '#ffffff',
    padding: 15
  },
  {
    id: 'lines-v-blue', name: 'Pionowe Niebieskie',
    moduleShape: 'classy-pt', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#1d4ed8',
    backgroundType: 'solid', backgroundColor: '#eff6ff',
    padding: 15
  },
  {
    id: 'lines-h-neon', name: 'Neonowe Paski',
    moduleShape: 'classys', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#10b981',
    backgroundType: 'solid', backgroundColor: '#000000',
    padding: 15
  },
  {
    id: 'extreme-contrast', name: 'Żółto-Czarny',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#000000',
    backgroundType: 'solid', backgroundColor: '#facc15',
    padding: 15
  },
  {
    id: 'hacker-matrix', name: 'Matrix',
    moduleShape: 'dots', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#22c55e',
    backgroundType: 'solid', backgroundColor: '#000000',
    padding: 15
  },

  // 31-40: Neon & Synthwave
  {
    id: 'synthwave-1', name: 'Synthwave 1',
    moduleShape: 'classy-pt', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#f9a8d4' }, { offset: 1, color: '#f43f5e' }] },
    backgroundType: 'solid', backgroundColor: '#172554', padding: 15
  },
  {
    id: 'synthwave-2', name: 'Synthwave 2',
    moduleShape: 'dots', markerOuterShape: 'dot', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#2dd4bf',
    backgroundType: 'solid', backgroundColor: '#312e81', padding: 15
  },
  {
    id: 'neon-nights', name: 'Neon Nights',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#a855f7',
    backgroundType: 'solid', backgroundColor: '#000000', padding: 15
  },
  {
    id: 'toxic-glow', name: 'Toxic Glow',
    moduleShape: 'classys', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#bef264',
    backgroundType: 'solid', backgroundColor: '#020617', padding: 15
  },
  {
    id: 'deep-purple', name: 'Deep Purple',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#c084fc',
    backgroundType: 'gradient',
    backgroundGradient: { type: 'radial', rotation: 0, colorStops: [{ offset: 0, color: '#2e1065' }, { offset: 1, color: '#000000' }] },
    padding: 15
  },
  {
    id: 'cyber-gold', name: 'Cyber Gold',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#fcd34d',
    backgroundType: 'solid', backgroundColor: '#1c1917', padding: 15
  },
  {
    id: 'blood-moon', name: 'Blood Moon',
    moduleShape: 'dots', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#fca5a5' }, { offset: 1, color: '#b91c1c' }] },
    backgroundType: 'solid', backgroundColor: '#27272a', padding: 15
  },
  {
    id: 'electric-blue', name: 'Electric Blue',
    moduleShape: 'classy-pt', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#60a5fa',
    backgroundType: 'solid', backgroundColor: '#0f172a', padding: 15
  },
  {
    id: 'plasma-wave', name: 'Plasma Wave',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#38bdf8' }, { offset: 1, color: '#e879f9' }] },
    backgroundType: 'solid', backgroundColor: '#020617', padding: 15
  },
  {
    id: 'dark-matter', name: 'Dark Matter',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#6b7280',
    backgroundType: 'solid', backgroundColor: '#000000', padding: 15
  },

  // 41-50: Jasne i Pastelowe
  {
    id: 'pastel-pink', name: 'Pastel Pink',
    moduleShape: 'dots', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#db2777',
    backgroundType: 'solid', backgroundColor: '#fdf2f8', padding: 15
  },
  {
    id: 'mint-cream', name: 'Mint Cream',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#0d9488',
    backgroundType: 'solid', backgroundColor: '#f0fdf4', padding: 15
  },
  {
    id: 'peach-fuzz', name: 'Peach',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#ea580c',
    backgroundType: 'solid', backgroundColor: '#fff7ed', padding: 15
  },
  {
    id: 'baby-blue', name: 'Baby Blue',
    moduleShape: 'classys', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#0284c7' }, { offset: 1, color: '#2563eb' }] },
    backgroundType: 'solid', backgroundColor: '#f0f9ff', padding: 15
  },
  {
    id: 'lemonade', name: 'Lemonade',
    moduleShape: 'dots', markerOuterShape: 'dot', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#ca8a04',
    backgroundType: 'solid', backgroundColor: '#fefce8', padding: 15
  },
  {
    id: 'lavender-mist', name: 'Lavender Mist',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#7e22ce',
    backgroundType: 'solid', backgroundColor: '#faf5ff', padding: 15
  },
  {
    id: 'rose-gold', name: 'Rose Gold',
    moduleShape: 'classy-pt', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#be185d' }, { offset: 1, color: '#e11d48' }] },
    backgroundType: 'solid', backgroundColor: '#fff1f2', padding: 15
  },
  {
    id: 'soft-sand', name: 'Soft Sand',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#b45309',
    backgroundType: 'solid', backgroundColor: '#fef3c7', padding: 15
  },
  {
    id: 'ice-water', name: 'Ice Water',
    moduleShape: 'dots', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#0891b2' }, { offset: 1, color: '#0ea5e9' }] },
    backgroundType: 'solid', backgroundColor: '#ecfeff', padding: 15
  },
  {
    id: 'cotton-candy', name: 'Cotton Candy',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#ec4899' }, { offset: 1, color: '#8b5cf6' }] },
    backgroundType: 'solid', backgroundColor: '#fdf4ff', padding: 15
  },

  // 51-60: Ekstremalne & Unikalne kształty
  {
    id: 'sharp-edges', name: 'Ostre Krawędzie',
    moduleShape: 'classy-pt', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#000000',
    backgroundType: 'solid', backgroundColor: '#e5e7eb', padding: 15
  },
  {
    id: 'heavy-dots', name: 'Ciężkie Kropki',
    moduleShape: 'dots', markerOuterShape: 'dot', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#1e3a8a',
    backgroundType: 'solid', backgroundColor: '#dbeafe', padding: 15
  },
  {
    id: 'classy-elegant', name: 'Klasyczna Elegancja',
    moduleShape: 'classys', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#111827' }, { offset: 1, color: '#4b5563' }] },
    backgroundType: 'solid', backgroundColor: '#f3f4f6', padding: 15
  },
  {
    id: 'contrast-red', name: 'Czerwień i Czerń',
    moduleShape: 'classys', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#000000',
    backgroundType: 'solid', backgroundColor: '#ef4444', padding: 15
  },
  {
    id: 'contrast-lime', name: 'Limonka',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#000000',
    backgroundType: 'solid', backgroundColor: '#a3e635', padding: 15
  },
  {
    id: 'zebra-lines', name: 'Zebra',
    moduleShape: 'classy-pt', markerOuterShape: 'extra-rounded', markerInnerShape: 'dot',
    foregroundType: 'gradient',
    foregroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#1f2937' }, { offset: 1, color: '#000000' }] },
    backgroundType: 'solid', backgroundColor: '#ffffff', padding: 15
  },
  {
    id: 'forest-night', name: 'Noc w Lesie',
    moduleShape: 'dots', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#a7f3d0',
    backgroundType: 'gradient',
    backgroundGradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#064e3b' }, { offset: 1, color: '#022c22' }] },
    padding: 15
  },
  {
    id: 'ocean-deep', name: 'Głębia Oceanu',
    moduleShape: 'classys', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#bae6fd',
    backgroundType: 'gradient',
    backgroundGradient: { type: 'radial', rotation: 0, colorStops: [{ offset: 0, color: '#0369a1' }, { offset: 1, color: '#082f49' }] },
    padding: 15
  },
  {
    id: 'sunburst', name: 'Wybuch Słońca',
    moduleShape: 'rounded', markerOuterShape: 'rounded', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#78350f',
    backgroundType: 'gradient',
    backgroundGradient: { type: 'radial', rotation: 0, colorStops: [{ offset: 0, color: '#fde047' }, { offset: 1, color: '#f59e0b' }] },
    padding: 15
  },
  {
    id: 'monochrome-dots', name: 'Monochromatyczne',
    moduleShape: 'dots', markerOuterShape: 'dot', markerInnerShape: 'dot',
    foregroundType: 'solid', foregroundColor: '#4b5563',
    backgroundType: 'solid', backgroundColor: '#e5e7eb', padding: 15
  }
];
