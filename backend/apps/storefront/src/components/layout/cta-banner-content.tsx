"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RevealHeading } from "@/components/ui/reveal-heading";

export function CtaBannerContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="bg-foreground text-background">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="container mx-auto px-4 py-20 md:py-28 text-center space-y-6"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-background/50">
          Wholesale Partnership
        </p>
        <RevealHeading className="text-3xl md:text-5xl font-light tracking-tight max-w-2xl mx-auto leading-tight justify-center">
          Ready to become a wholesale partner?
        </RevealHeading>
        {/* TODO: Replace with approved CTA sub-copy from Maniadis */}
        <p className="text-background/60 text-base md:text-lg max-w-md mx-auto leading-relaxed">
          Join hundreds of retailers who trust Maniadis for their seasonal bag and hat collections.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          {!isLoggedIn && (
            <Button
              asChild
              size="lg"
              className="min-w-[180px] bg-background text-foreground hover:bg-background/90"
            >
              <Link href="/register">Register Now</Link>
            </Button>
          )}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="min-w-[180px] bg-transparent border-background/30 text-background hover:bg-background/10 hover:text-background dark:bg-transparent"
          >
            <Link href="/search">Browse Catalog</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
