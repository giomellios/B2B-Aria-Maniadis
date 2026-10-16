"use client";

import { motion } from "framer-motion";
import { useEntranceAnimation } from "@/design-system/motion/use-entrance-animation";

interface RevealHeadingProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

const MotionTags = { h1: motion.h1, h2: motion.h2, h3: motion.h3 };

// A heading that rises into place once, the first time it scrolls into view.
export function RevealHeading({ children, className = "", as = "h2" }: RevealHeadingProps) {
  const entrance = useEntranceAnimation();
  const Tag = MotionTags[as];

  return (
    <Tag
      initial={entrance ? { opacity: 0, y: 14 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}
