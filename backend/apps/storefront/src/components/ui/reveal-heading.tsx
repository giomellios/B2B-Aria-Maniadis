"use client";

import { motion } from "framer-motion";

interface RevealHeadingProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

const wordVariant = {
  hidden: { y: "110%", opacity: 0 },
  show: (i: number) => ({
    y: "0%",
    opacity: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: i * 0.08 },
  }),
};

export function RevealHeading({ children, className = "", as: Tag = "h2" }: RevealHeadingProps) {
  const words = children.split(" ");

  return (
    <Tag className={`flex flex-wrap gap-x-[0.3em] overflow-hidden ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            custom={i}
            variants={wordVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
