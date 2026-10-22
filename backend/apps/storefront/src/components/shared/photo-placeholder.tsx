import Image from "next/image";
import { ImageIcon } from "@/design-system/icons";
import { cn } from "@/lib/utils";

/**
 * A reserved picture slot. Until a real image is chosen it shows a labelled placeholder; pass
 * `src` (and `alt`) to fill it — the slot keeps its size, corners and crop either way.
 */
export function PhotoPlaceholder({
  label,
  src,
  alt = "",
  className,
}: {
  label: string;
  src?: string;
  alt?: string;
  className?: string;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-xl", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-input bg-card text-muted-foreground",
        className
      )}
    >
      <ImageIcon className="size-8" weight="light" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
