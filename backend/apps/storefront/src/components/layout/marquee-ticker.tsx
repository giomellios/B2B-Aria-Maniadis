"use client";

import { motion } from "framer-motion";

const ITEMS = [
  "Bags",
  "Hats",
  "Wholesale",
  "New Season",
  "Greece",
  "Europe",
  "Quality",
  "Style",
  "Collections",
  "Accessories",
];

export function MarqueeTicker() {
  const repeated = [...ITEMS, ...ITEMS];

  return (
    <div className="border-y border-border py-3.5 overflow-hidden bg-background select-none">
      <motion.div
        animate={{ x: "-50%" }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex w-max"
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-6 text-xs tracking-[0.25em] uppercase text-muted-foreground whitespace-nowrap px-6"
          >
            {item}
            <span className="text-muted-foreground/30">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
