"use client";

import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { useT } from "@/lib/i18n/provider";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/design-system";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay },
  }),
};

export function HeroSection() {
  const hero = useT().home.hero;
  // TODO: Confirm these facts with Maniadis (founding year is taken from the crest)
  const facts = [
    { value: "1965", label: hero.facts.established },
    { value: hero.facts.b2bValue, label: hero.facts.b2b },
    { value: hero.facts.deliveryValue, label: hero.facts.delivery },
  ];

  return (
    <section aria-label={hero.aria} className="border-b border-border pt-16">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div className="space-y-8">
            <motion.p
              variants={rise}
              custom={0.05}
              initial="hidden"
              animate="show"
              className="eyebrow"
            >
              {hero.eyebrow}
            </motion.p>

            {/* TODO: Replace with approved headline copy from Maniadis */}
            <motion.h1
              variants={rise}
              custom={0.15}
              initial="hidden"
              animate="show"
              className="display text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-7xl"
            >
              {hero.titleLine1}
              <br />
              <span className="text-primary">{hero.titleLine2}</span>
            </motion.h1>

            {/* TODO: Replace with approved sub-headline copy from Maniadis */}
            <motion.p
              variants={rise}
              custom={0.3}
              initial="hidden"
              animate="show"
              className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              {hero.subtitle}
            </motion.p>

            <motion.div
              variants={rise}
              custom={0.42}
              initial="hidden"
              animate="show"
              className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2"
            >
              <Button asChild size="lg" className="group">
                <Link href="/search">
                  {hero.browse}
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Link
                href="/register"
                className="link-underline text-sm font-semibold text-foreground"
              >
                {hero.becomePartner}
              </Link>
            </motion.div>
          </div>

          {/* Crest panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE, delay: 0.1 }}
            className="relative mx-auto w-full max-w-sm lg:max-w-none"
          >
            <div className="relative aspect-[4/3] rounded-lg bg-primary p-3 sm:aspect-[5/4] lg:aspect-[4/5] dark:border dark:border-border dark:bg-card">
              <div className="flex h-full flex-col items-center justify-center gap-5 rounded-[3px] border border-primary-foreground/25 px-8 text-center text-primary-foreground lg:gap-8 dark:border-border dark:text-foreground">
                <Image
                  src="/logo.png"
                  alt={hero.crestAlt}
                  width={169}
                  height={210}
                  priority
                  className="h-32 w-auto brightness-0 invert sm:h-44 lg:h-64"
                />
                <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-primary-foreground/70 dark:text-muted-foreground">
                  {hero.crestCaption}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Facts strip */}
        <motion.dl
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.6 } },
          }}
          className="grid grid-cols-3 border-t border-border"
        >
          {facts.map((fact) => (
            <motion.div
              key={fact.label}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
              }}
              className="flex flex-col-reverse gap-1 border-l border-border px-3 py-6 first:border-l-0 first:pl-0 sm:px-8"
            >
              <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="display text-2xl text-primary sm:text-3xl">{fact.value}</dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
