import { motion, Variants } from 'framer-motion';

/**
 * Fade in animation variants
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Slide up animation variants
 */
export const slideUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Scale in animation variants
 */
export const scaleIn: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Stagger children animation
 * @param staggerChildren - Stagger duration between children (default: 0.05)
 * @returns Animation variants
 */
export const staggerContainer = (staggerChildren: number = 0.05): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
});

/**
 * Bounce animation for buttons and interactive elements
 */
export const bounce = {
  initial: { scale: 1 },
  tap: { 
    scale: 0.95,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    } 
  },
  hover: { 
    scale: 1.05,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    } 
  }
};

/**
 * Pulse animation for notifications or attention-grabbing elements
 */
export const pulse = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.05, 1],
    transition: { 
      repeat: Infinity,
      repeatType: "reverse" as const,
      duration: 1.5
    }
  }
};

/**
 * Shake animation for errors or invalid actions
 */
export const shake = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5
    }
  }
};

/**
 * Animation for the Pomodoro timer progress
 * @param progress - Current progress (0-100)
 * @returns Animation variants
 */
export const timerProgress = (progress: number) => ({
  initial: { pathLength: 0 },
  animate: { 
    pathLength: progress / 100,
    transition: { 
      type: 'spring',
      stiffness: 100,
      damping: 20
    }
  }
});

/**
 * Animation for the gacha box opening
 */
export const gachaReveal = {
  initial: { scale: 0.8, opacity: 0, rotateY: 180 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    rotateY: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0, 
    rotateY: -180,
    transition: { duration: 0.2 }
  }
};

/**
 * Animation for growing plants
 */
export const grow = {
  initial: { scaleY: 0, transformOrigin: 'bottom' },
  animate: { 
    scaleY: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 0.61, 0.36, 1]
    }
  }
};

/**
 * Animation for water splash
 */
export const splash = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: [0, 1.2, 1],
    opacity: [0, 0.8, 0],
    transition: {
      duration: 0.6
    }
  }
};

/**
 * Animation for coin collection
 */
export const coinCollect = {
  initial: { y: 0, opacity: 1 },
  animate: (custom: number) => ({
    y: -50,
    opacity: 0,
    x: Math.sin(custom * 0.5) * 100, // Slight horizontal movement
    transition: {
      duration: 0.8,
      ease: 'easeOut'
    }
  })
};

/**
 * Animation for level up
 */
export const levelUp = {
  initial: { scale: 0 },
  animate: { 
    scale: [0, 1.2, 1],
    transition: {
      duration: 0.6,
      ease: 'backOut'
    }
  },
  exit: { 
    scale: 0,
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

/**
 * Animation for tooltips
 */
export const tooltip = {
  initial: { opacity: 0, y: 5 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    y: 5,
    transition: { duration: 0.15 }
  }
};

/**
 * Animation for page transitions
 */
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: 'easeInOut'
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.2,
      ease: 'easeInOut'
    }
  }
};
