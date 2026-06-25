export const TAG_COLORS = [
  { id: 'mint', bg: 'bg-[#4ade80]', text: 'text-[#4ade80]', border: 'border-[#4ade80]' },
  { id: 'cyan', bg: 'bg-[#22d3ee]', text: 'text-[#22d3ee]', border: 'border-[#22d3ee]' },
  { id: 'blue', bg: 'bg-[#60a5fa]', text: 'text-[#60a5fa]', border: 'border-[#60a5fa]' },
  { id: 'purple', bg: 'bg-[#a78bfa]', text: 'text-[#a78bfa]', border: 'border-[#a78bfa]' },
  { id: 'yellow', bg: 'bg-[#fde047]', text: 'text-[#fde047]', border: 'border-[#fde047]' },
  { id: 'orange', bg: 'bg-[#fb923c]', text: 'text-[#fb923c]', border: 'border-[#fb923c]' },
  { id: 'coral', bg: 'bg-[#f87171]', text: 'text-[#f87171]', border: 'border-[#f87171]' },
  { id: 'pink', bg: 'bg-[#f472b6]', text: 'text-[#f472b6]', border: 'border-[#f472b6]' }
];

export const getTagColorInfo = (colorId) => {
  return TAG_COLORS.find(c => c.id === colorId) || TAG_COLORS[3]; // Domyślnie fioletowy
};

export const renderTagStyle = (colorId) => {
  if (colorId?.startsWith('#')) {
    return {
      className: 'border bg-opacity-10',
      style: {
        color: colorId,
        borderColor: colorId,
        backgroundColor: `${colorId}1A`
      }
    };
  }
  
  const style = getTagColorInfo(colorId);
  return {
    className: `border bg-opacity-10 ${style.bg.replace('bg-', 'bg-').replace(']', ']/10')} ${style.text} ${style.border}`,
    style: {}
  };
};
