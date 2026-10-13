"use client";

import { motion } from "framer-motion";
import { Layers, Tag, RefreshCw, Truck } from "lucide-react";
import { RevealHeading } from "@/design-system";
import { useT } from "@/lib/i18n/provider";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function ValueProps() {
  const t = useT().home.values;
  // TODO: Update copy with real Maniadis messaging when approved
  const props = [
    { icon: Layers, title: t.selection, description: t.selectionText },
    { icon: Tag, title: t.pricing, description: t.pricingText },
    { icon: RefreshCw, title: t.restocking, description: t.restockingText },
    { icon: Truck, title: t.delivery, description: t.deliveryText },
  ];

  return (
    <section className="border-y border-border bg-secondary py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-14 grid gap-6 md:grid-cols-2 md:items-end">
          <div className="space-y-3">
            <p className="eyebrow">{t.eyebrow}</p>
            <RevealHeading className="display text-4xl md:text-5xl">{t.title}</RevealHeading>
          </div>
          <p className="max-w-md text-muted-foreground md:justify-self-end">{t.intro}</p>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0"
        >
          {props.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={item}
              className="group space-y-4 lg:border-l lg:border-border lg:px-8 lg:first:border-l-0 lg:first:pl-0"
            >
              <Icon
                className="size-6 text-primary transition-transform duration-500 ease-out group-hover:-translate-y-0.5"
                strokeWidth={1.25}
              />
              <div className="space-y-2">
                <p className="font-serif text-xl text-foreground">{title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
