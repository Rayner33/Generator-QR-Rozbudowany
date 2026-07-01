export function getInitials(name, fallback = 'U') {
  if (!name || typeof name !== 'string') return fallback;
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  if (words.length === 1 && words[0].length > 0) {
    return words[0].charAt(0).toUpperCase();
  }
  return fallback;
}
