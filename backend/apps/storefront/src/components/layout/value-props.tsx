"use client";

import { motion } from "framer-motion";
import { Layers, Tag, RefreshCw, Truck } from "lucide-react";
import { RevealHeading } from "@/components/ui/reveal-heading";

// TODO: Update copy with real Maniadis messaging when approved
const PROPS = [
  {
    icon: Layers,
    title: "Wide Selection",
    description:
      "Hundreds of styles across bags and hats, refreshed every season to keep your offer current.",
  },
  {
    icon: Tag,
    title: "Wholesale Pricing",
    description:
      "Competitive tiered pricing for registered retail partners, with volume discounts available.",
  },
  {
    icon: RefreshCw,
    title: "Reliable Restocking",
    description:
      "Consistent stock availability so your shelves are never left empty mid-season.",
  },
  {
    icon: Truck,
    title: "Pan-European Delivery",
    description:
      "Fast, reliable shipping to retailers across Greece and the broader EU.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function ValueProps() {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="mb-12 space-y-2">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
            Why Maniadis
          </p>
          <RevealHeading className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
            Built for Retailers
          </RevealHeading>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {PROPS.map(({ icon: Icon, title, description }) => (
            <motion.div key={title} variants={item} className="space-y-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-md bg-background border border-border">
                <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
