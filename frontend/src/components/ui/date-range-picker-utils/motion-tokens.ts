export const motionTokens = {
  blur: {
    subtle: 4,
    soft: 8,
  },
  ease: {
    enter: [0.16, 1, 0.3, 1] as const,
    standard: [0.22, 1, 0.36, 1] as const,
    exit: [0.7, 0, 0.84, 0] as const,
  },
  spring: {
    morph: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
};
