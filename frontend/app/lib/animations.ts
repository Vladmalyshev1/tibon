import type { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0, 0, 0.2, 1] } },
};

export const mobileMenuMotion: Variants = {
  hidden: { opacity: 0, x: "100%" },
  visible: { opacity: 1, x: 0, transition: { duration: 0.24, ease: [0, 0, 0.2, 1] } },
  exit: { opacity: 0, x: "100%", transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};
