export const PREDEFINED_GRADIENTS = [
  'linear-gradient(to top right, #FF4C00, #9333ea)',
  'linear-gradient(to bottom right, #3b82f6, #8b5cf6)',
  'linear-gradient(to bottom right, #10b981, #3b82f6)',
  'linear-gradient(to bottom right, #f59e0b, #ef4444)',
  'linear-gradient(to bottom right, #ec4899, #8b5cf6)',
  'linear-gradient(to bottom right, #14b8a6, #6366f1)',
  '#2563eb',
  '#ef4444',
  '#10b981'
];

export function darkenHex(hex, amount = 40) {
  let usePound = false;
  if (hex[0] === "#") {
    hex = hex.slice(1);
    usePound = true;
  }
  let num = parseInt(hex, 16);
  let r = (num >> 16) - amount;
  if (r > 255) r = 255; else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00FF) - amount;
  if (b > 255) b = 255; else if (b < 0) b = 0;
  let g = (num & 0x0000FF) - amount;
  if (g > 255) g = 255; else if (g < 0) g = 0;
  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}
