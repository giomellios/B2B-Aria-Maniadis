"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface CategoryGridClientProps {
  collections: Collection[];
}

// TODO: Replace gradient placeholders with real collection images once Vendure assets are uploaded.
// In category-grid.tsx, pass featuredAsset.preview from each collection and render with next/image instead.
const CARD_GRADIENTS = [
  "from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800",
  "from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800",
  "from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800",
  "from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const card = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function CategoryGridClient({ collections }: CategoryGridClientProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {collections.map((collection, i) => (
        <motion.div key={collection.id} variants={card}>
          <Link href={`/collection/${collection.slug}`} className="group block">
            <div
              className={`relative h-52 rounded-lg bg-gradient-to-br ${
                CARD_GRADIENTS[i % CARD_GRADIENTS.length]
              } overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]`}
            >
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <p className="text-xs tracking-widest uppercase text-foreground/60 mb-1">
                  Collection
                </p>
                <p className="text-xl font-light tracking-tight text-foreground">
                  {collection.name}
                </p>
              </div>
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
