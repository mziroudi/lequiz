export const easeSmooth = [0.4, 0.2, 0.2, 1];

export const flipTransition = { duration: 0.65, ease: easeSmooth };

export const slideTransition = { duration: 0.45, ease: easeSmooth };

export const fadeUpTransition = { duration: 0.5, ease: easeSmooth };

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const slideVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction === 'next' ? 40 : -40,
    scale: 0.96,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction === 'next' ? -40 : 40,
    scale: 0.96,
  }),
};
