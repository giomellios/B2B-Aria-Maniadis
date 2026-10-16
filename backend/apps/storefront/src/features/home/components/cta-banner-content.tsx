"use client";

import { Link } from "@/lib/i18n/navigation";
import { useT } from "@/lib/i18n/provider";
import { motion } from "framer-motion";
import { ArrowRight } from "@/design-system/icons";
import { Button, useEntranceAnimation } from "@/design-system";

export function CtaBannerContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  const entrance = useEntranceAnimation();
  const t = useT().home.cta;
  return (
    <section className="bg-primary text-primary-foreground dark:bg-card dark:text-foreground">
      <motion.div
        initial={entrance ? { opacity: 0, y: 24 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="container mx-auto grid gap-10 px-4 py-20 md:grid-cols-[1fr_auto] md:items-end md:py-28"
      >
        <div className="max-w-2xl space-y-5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] opacity-70">
            {t.eyebrow}
          </p>
          <h2 className="font-serif text-4xl leading-[1.1] md:text-6xl">{t.title}</h2>
          {/* TODO: Replace with approved CTA sub-copy from Maniadis */}
          <p className="max-w-md text-base leading-relaxed opacity-75 md:text-lg">{t.text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {!isLoggedIn && (
            <Button
              asChild
              size="lg"
              className="group bg-primary-foreground text-primary hover:bg-primary-foreground/90 dark:bg-primary dark:text-primary-foreground"
            >
              <Link href="/register">
                {t.apply}
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          )}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-current/30 text-current hover:border-current hover:bg-transparent hover:text-current"
          >
            <Link href="/search">{t.browse}</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
