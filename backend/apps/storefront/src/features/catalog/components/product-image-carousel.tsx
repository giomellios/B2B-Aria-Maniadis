"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "@/design-system/icons";
import { Button } from "@/design-system";
import { useT } from "@/lib/i18n/provider";
import { format } from "@/lib/i18n/dictionaries";

interface ProductImageCarouselProps {
  images: Array<{
    id: string;
    preview: string;
    source: string;
  }>;
  // Variant images keyed by their options, so the carousel can follow the options selected in the URL
  variantImages?: Array<{
    assetId: string;
    options: Array<{ groupCode: string; optionCode: string }>;
  }>;
}

export function ProductImageCarousel({ images, variantImages = [] }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const t = useT().product;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Options shared by every variant that uses this image (e.g. the colour, not the decoration)
  const optionsForImage = useCallback(
    (assetId: string) => {
      const matches = variantImages.filter((v) => v.assetId === assetId);
      if (matches.length === 0) return [];
      return matches[0].options.filter((o) =>
        matches.every((v) =>
          v.options.some((p) => p.groupCode === o.groupCode && p.optionCode === o.optionCode)
        )
      );
    },
    [variantImages]
  );

  // Write an image's options (its colour) to the URL, where the option buttons read them from
  const selectOptionsForImage = useCallback(
    (index: number) => {
      const options = images[index] ? optionsForImage(images[index].id) : [];
      if (options.length === 0) return;
      const params = new URLSearchParams(searchParams);
      options.forEach((o) => params.set(o.groupCode, o.optionCode));
      if (params.toString() !== searchParams.toString()) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [images, optionsForImage, searchParams, router, pathname]
  );

  const showImage = (index: number) => {
    setCurrentIndex(index);
    selectOptionsForImage(index);
  };

  // On first load without a selection, mark the colour of the image being shown as selected
  useEffect(() => {
    const hasSelection = variantImages.some((v) =>
      v.options.some((o) => searchParams.has(o.groupCode))
    );
    if (!hasSelection) {
      selectOptionsForImage(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, []);

  // Image of the first variant that matches every option selected so far (e.g. only the colour)
  const selectedImageIndex = useMemo(() => {
    const variant = variantImages.find((v) => {
      const selected = v.options.filter((o) => searchParams.has(o.groupCode));
      return (
        selected.length > 0 && selected.every((o) => searchParams.get(o.groupCode) === o.optionCode)
      );
    });
    return variant ? images.findIndex((image) => image.id === variant.assetId) : -1;
  }, [searchParams, variantImages, images]);

  useEffect(() => {
    if (selectedImageIndex >= 0) {
      setCurrentIndex(selectedImageIndex);
    }
  }, [selectedImageIndex]);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-md border border-border bg-secondary">
        <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {t.noImages}
        </span>
      </div>
    );
  }

  const goToPrevious = () => {
    showImage(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    showImage(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="group relative aspect-square overflow-hidden rounded-md border border-border bg-white">
        <Image
          key={images[currentIndex].id}
          src={images[currentIndex].source}
          alt={format(t.imageAlt, { n: currentIndex + 1 })}
          fill
          className="animate-in fade-in-0 zoom-in-[1.02] object-cover duration-500 ease-out"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={currentIndex === 0}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              aria-label={t.previousImage}
              className="absolute left-3 top-1/2 size-10 -translate-x-2 -translate-y-1/2 rounded-full border-border bg-background/90 opacity-0 backdrop-blur transition-[opacity,transform,color,border-color] duration-300 group-hover:translate-x-0 group-hover:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={t.nextImage}
              className="absolute right-3 top-1/2 size-10 translate-x-2 -translate-y-1/2 rounded-full border-border bg-background/90 opacity-0 backdrop-blur transition-[opacity,transform,color,border-color] duration-300 group-hover:translate-x-0 group-hover:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-sm bg-background/90 px-2 py-1 text-[0.6875rem] font-medium tabular-nums text-muted-foreground backdrop-blur">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => showImage(index)}
              aria-label={format(t.showImage, { n: index + 1 })}
              aria-current={index === currentIndex}
              className={`relative aspect-square overflow-hidden rounded-sm border bg-white transition-[border-color,opacity,box-shadow] duration-200 ${
                index === currentIndex
                  ? "border-primary ring-1 ring-primary"
                  : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={image.preview} alt="" fill className="object-cover" sizes="20vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
