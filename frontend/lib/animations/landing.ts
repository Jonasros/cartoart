// Animation presets for landing page sections
// Using Framer Motion variants

// Custom easing curve (ease-out-expo like)
const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: easeOutExpo }
};

export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: easeOutExpo }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: easeOutExpo }
};

export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: easeOutExpo }
};

// Stagger container for child animations
export const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  viewport: { once: true, margin: "-100px" }
};

// Child item for stagger animations
export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: easeOutExpo }
};

// Floating animation for hero posters
export const floatingPoster = (index: number) => ({
  initial: {
    opacity: 0,
    scale: 0.85,
    rotate: -5 + (index * 3)
  },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: -3 + (index * 2),
    y: [0, -8, 0],
    transition: {
      opacity: { duration: 0.6, delay: index * 0.15 },
      scale: { duration: 0.6, delay: index * 0.15 },
      rotate: { duration: 0.6, delay: index * 0.15 },
      y: {
        duration: 4 + index * 0.5,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const,
        delay: index * 0.3
      }
    }
  }
});

// Parallax values for scroll-linked animations
export const parallaxValues = {
  slow: { inputRange: [0, 1], outputRange: [0, -50] },
  medium: { inputRange: [0, 1], outputRange: [0, -100] },
  fast: { inputRange: [0, 1], outputRange: [0, -150] }
};
