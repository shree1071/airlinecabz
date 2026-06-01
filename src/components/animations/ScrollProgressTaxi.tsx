"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export function ScrollProgressTaxi() {
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);
  
  // Smooth out the scroll progress
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Map scroll progress to a horizontal position (0% to 100vw)
  // We use useTransform to ensure it stays in sync with framer-motion's optimized pipeline
  const xPos = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[100] pointer-events-none">
      {/* The Road (Progress Bar) */}
      <motion.div
        className="absolute top-0 left-0 bottom-0 w-full bg-brandBlue origin-left"
        style={{ scaleX }}
      />
      
      {/* The Taxi */}
      <motion.div
        className="absolute top-[-14px] text-brandDark drop-shadow-lg flex items-center"
        style={{ left: xPos, x: "-100%" }}
      >
        <div className="relative">
          {/* Exhaust fume trail */}
          <motion.div
            className="absolute top-1/2 -left-4 w-6 h-1 bg-gradient-to-r from-transparent to-slate-300 rounded-full blur-[1px]"
            style={{ opacity: scrollYProgress }}
          />
          <span className="material-symbols-outlined text-[24px]">local_taxi</span>
        </div>
      </motion.div>
    </div>
  );
}
