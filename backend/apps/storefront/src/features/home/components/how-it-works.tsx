"use client";

import { motion } from "framer-motion";
import { RevealHeading, useEntranceAnimation } from "@/design-system";
import { useT } from "@/lib/i18n/provider";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function HowItWorks() {
  const entrance = useEntranceAnimation();
  const t = useT().home.steps;
  // TODO: Confirm the actual ordering/approval process with Maniadis and update step descriptions accordingly
  const steps = [
    { title: t.register, description: t.registerText },
    { title: t.browse, description: t.browseText },
    { title: t.order, description: t.orderText },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-14 space-y-3">
          <p className="eyebrow">{t.eyebrow}</p>
          <RevealHeading className="display text-4xl md:text-5xl">{t.title}</RevealHeading>
        </div>

        <motion.ol
          initial={entrance ? "hidden" : false}
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10"
        >
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
              }}
              className="relative space-y-4 pt-8"
            >
              {/* Rule that draws itself across when the step appears */}
              <motion.span
                aria-hidden
                variants={{
                  hidden: { scaleX: 0 },
                  show: { scaleX: 1, transition: { duration: 0.9, ease: EASE } },
                }}
                className="absolute left-0 right-0 top-0 h-px origin-left bg-primary"
              />
              <p className="display text-5xl text-primary">{i + 1}</p>
              <p className="font-serif text-2xl text-foreground">{step.title}</p>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
