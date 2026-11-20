import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type RevealProps = { children: ReactNode; delay?: number; className?: string };

export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reducedMotion ? undefined : { opacity: [0.8, 1], y: [8, 0] }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
