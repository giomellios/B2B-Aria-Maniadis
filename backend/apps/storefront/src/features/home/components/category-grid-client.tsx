"use client";

import { Link } from "@/lib/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface CategoryGridClientProps {
  collections: Collection[];
}

// TODO: Show each collection's featuredAsset once collection images are uploaded in Vendure
// (add featuredAsset { preview } to GetTopCollectionsQuery and render it with next/image).

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const card = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function CategoryGridClient({ collections }: CategoryGridClientProps) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3"
    >
      {collections.map((collection, i) => (
        <motion.li key={collection.id} variants={card} className="border-b border-r border-border">
          <Link
            href={`/collection/${collection.slug}`}
            className="group relative flex h-full min-h-44 flex-col justify-between bg-card p-6 transition-colors duration-300 hover:bg-primary md:min-h-56 md:p-8"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs tabular-nums text-muted-foreground transition-colors duration-300 group-hover:text-primary-foreground/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <ArrowUpRight
                className="size-5 text-primary transition-[transform,color] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-foreground"
                strokeWidth={1.5}
              />
            </div>
            <p className="font-serif text-3xl leading-tight text-foreground transition-colors duration-300 group-hover:text-primary-foreground md:text-4xl">
              {collection.name}
            </p>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
