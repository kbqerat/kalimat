"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Fade-and-rise entrance, triggered once when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.55, delay, ease: [0.2, 0.9, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
