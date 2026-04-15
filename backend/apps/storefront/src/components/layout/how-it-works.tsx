"use client";

import { motion } from "framer-motion";
import { RevealHeading } from "@/components/ui/reveal-heading";

// TODO: Confirm the actual ordering/approval process with Maniadis and update step descriptions accordingly
const STEPS = [
  {
    number: "01",
    title: "Register",
    description:
      "Create a wholesale account in minutes. Our team reviews and approves new partners promptly.",
  },
  {
    number: "02",
    title: "Browse the Catalog",
    description:
      "Explore our full range of bags and hats, filtered by category, style, or season.",
  },
  {
    number: "03",
    title: "Place Your Order",
    description:
      "Order online at any time. We handle packing and dispatch so your stock arrives on time.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 space-y-2">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
            Getting Started
          </p>
          <RevealHeading className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
            How It Works
          </RevealHeading>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-0"
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              variants={item}
              className="relative flex flex-col gap-4 p-8 border border-border first:rounded-t-lg last:rounded-b-lg md:first:rounded-l-lg md:first:rounded-tr-none md:last:rounded-r-lg md:last:rounded-bl-none"
            >
              {/* Connector line between steps on desktop */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-[1px] w-px h-12 bg-border z-10" />
              )}

              <p className="text-4xl font-extralight text-muted-foreground/40 tracking-tight">
                {step.number}
              </p>
              <div className="space-y-2">
                <p className="text-base font-medium text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
