"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">No images available</span>
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
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-white rounded-lg overflow-hidden group">
        <Image
          src={images[currentIndex].source}
          alt={`Product image ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={currentIndex === 0}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => showImage(index)}
              className={`aspect-square relative rounded-lg overflow-hidden border-2 bg-white transition-colors ${
                index === currentIndex
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground"
              }`}
            >
              <Image
                src={image.preview}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="25vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
