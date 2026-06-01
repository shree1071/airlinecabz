"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  inView?: boolean;
  yOffset?: number;
}

export function BlurFade({
  children,
  className = "",
  delay = 0,
  inView = true,
  yOffset = 24,
}: BlurFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, filter: "blur(8px)" }}
      whileInView={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: yOffset, filter: "blur(8px)" }
      }
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        delay,
        duration: 0.6,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
