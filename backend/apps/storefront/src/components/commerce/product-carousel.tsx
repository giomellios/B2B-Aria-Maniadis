"use client";

import { ProductCard } from "@/components/commerce/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FragmentOf, readFragment } from "@/graphql";
import { ProductCardFragment } from "@/lib/vendure/fragments";
import { useId } from "react";
import { motion } from "framer-motion";

interface ProductCarouselClientProps {
  title: string;
  products: Array<FragmentOf<typeof ProductCardFragment>>;
  fallbackImagesBySlug?: Record<string, string>;
}

export function ProductCarousel({
  title,
  products,
  fallbackImagesBySlug,
}: ProductCarouselClientProps) {
  const id = useId();

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="py-12 md:py-16"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-8">{title}</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
              {products.map((product, i) => {
                const productData = readFragment(ProductCardFragment, product);

                return (
                  <CarouselItem
                    key={id + i}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <ProductCard
                      product={product}
                      fallbackImageUrl={fallbackImagesBySlug?.[productData.slug] ?? null}
                    />
                  </CarouselItem>
                );
              })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </motion.section>
  );
}
