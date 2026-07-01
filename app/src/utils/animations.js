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

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, scale: 0.96, y: 15 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", bounce: 0, duration: 0.5 } 
  }
};
