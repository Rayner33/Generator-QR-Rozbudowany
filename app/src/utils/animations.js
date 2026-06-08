export const dropdownAnimation = {
  initial: { opacity: 0, scale: 0.95, y: -5 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -5 },
  transition: { duration: 0.15, ease: "easeOut" }
};

export const modalAnimation = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { type: "spring", bounce: 0, duration: 0.3 }
};

export const slidePanelAnimation = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: { type: "spring", bounce: 0, duration: 0.4 }
};

export const magicHoverAnimation = {
  initial: false,
  transition: { type: "spring", bounce: 0, duration: 0.2 }
};
