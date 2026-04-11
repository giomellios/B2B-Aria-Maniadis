"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

// TODO: Replace placeholder values with real Maniadis stats
const STATS: Array<
  | { numeric: number; suffix: string; label: string }
  | { numeric: null; display: string; label: string }
> = [
  { numeric: 20, suffix: "+", label: "Years in Business" },
  { numeric: 500, suffix: "+", label: "Active Retailers" },
  { numeric: 1000, suffix: "+", label: "Products Available" },
  { numeric: null, display: "EU-Wide", label: "Delivery Coverage" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function AnimatedCounter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) =>
    Math.round(v).toLocaleString("en-US")
  );

  useEffect(() => {
    if (isInView) {
      animate(count, to, { duration: 1.8, ease: "easeOut" });
    }
  }, [isInView, count, to]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function TrustBar() {
  return (
    <section className="border-y border-border bg-background">
      <div className="container mx-auto px-4 py-10">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {STATS.map((stat) => (
            <motion.div key={stat.label} variants={item} className="text-center space-y-1">
              <p className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
                {stat.numeric !== null ? (
                  <AnimatedCounter to={stat.numeric} suffix={stat.suffix} />
                ) : (
                  stat.display
                )}
              </p>
              <p className="text-xs tracking-widest uppercase text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
