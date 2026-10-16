"use client";

import { ProductCard } from "@/features/catalog/components/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useEntranceAnimation,
} from "@/design-system";
import { FragmentOf, readFragment } from "@/lib/api/graphql";
import { ProductCardFragment } from "@/features/catalog/services/fragments";
import { useId } from "react";
import { motion } from "framer-motion";

interface ProductCarouselClientProps {
  eyebrow: string;
  title: string;
  products: Array<FragmentOf<typeof ProductCardFragment>>;
  fallbackImagesBySlug?: Record<string, string>;
}

export function ProductCarousel({
  eyebrow,
  title,
  products,
  fallbackImagesBySlug,
}: ProductCarouselClientProps) {
  const entrance = useEntranceAnimation();
  const id = useId();

  return (
    <motion.section
      initial={entrance ? { opacity: 0, y: 24 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <div className="mb-10 flex items-end justify-between gap-6">
            <div className="space-y-3">
              <p className="eyebrow">{eyebrow}</p>
              <h2 className="display text-4xl md:text-5xl">{title}</h2>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <CarouselPrevious className="static size-10 translate-y-0 hover:-translate-x-0.5" />
              <CarouselNext className="static size-10 translate-y-0 hover:translate-x-0.5" />
            </div>
          </div>
          <CarouselContent className="-ml-4 md:-ml-6">
            {products.map((product, i) => {
              const productData = readFragment(ProductCardFragment, product);

              return (
                <CarouselItem
                  key={id + i}
                  className="basis-1/2 pl-4 md:pl-6 lg:basis-1/3 xl:basis-1/4"
                >
                  <ProductCard
                    product={product}
                    fallbackImageUrl={fallbackImagesBySlug?.[productData.slug] ?? null}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </motion.section>
  );
}
