"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// TODO: Replace with approved headline copy from Maniadis
const WORDS = ["Bags", "&", "Hats", "for", "Every", "Season"];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const wordVariant = {
  hidden: { y: "110%", opacity: 0 },
  show: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  }),
};

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.6], ["0%", "12%"]);

  return (
    <section ref={ref} aria-label="Welcome to Maniadis" className="bg-muted overflow-hidden">
      <motion.div
        style={{ opacity, y }}
        className="container mx-auto px-4 py-28 md:py-48"
      >
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Overline */}
          <motion.p
            variants={fadeUp}
            custom={0.1}
            initial="hidden"
            animate="show"
            className="text-xs tracking-[0.3em] uppercase text-muted-foreground"
          >
            Wholesale Collections
          </motion.p>

          {/* Headline — word-by-word reveal */}
          <motion.h1
            variants={container}
            initial="hidden"
            animate="show"
            className="text-5xl md:text-7xl font-light tracking-tight text-foreground leading-tight flex flex-wrap justify-center gap-x-4 gap-y-1 overflow-hidden"
          >
            {WORDS.map((word, i) => (
              <span key={i} className="overflow-hidden inline-block">
                <motion.span
                  variants={wordVariant}
                  className={`inline-block ${i >= 3 ? "text-muted-foreground font-extralight" : ""}`}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          {/* Sub-copy */}
          {/* TODO: Replace with approved sub-headline copy from Maniadis */}
          <motion.p
            variants={fadeUp}
            custom={1.1}
            initial="hidden"
            animate="show"
            className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md mx-auto"
          >
            Curated wholesale accessories for retailers who value quality and distinction.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            custom={1.4}
            initial="hidden"
            animate="show"
            className="pt-2"
          >
            <Button asChild size="lg" className="min-w-[180px]">
              <Link href="/search">Browse Catalog</Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
