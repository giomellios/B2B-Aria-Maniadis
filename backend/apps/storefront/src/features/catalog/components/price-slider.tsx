"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PriceSliderProps {
  /** Bounds in cents. */
  min: number;
  max: number;
  /** Selected range in cents (defaults to the bounds). */
  value: { min: number; max: number };
  format: (cents: number) => string;
  labels: { min: string; max: string };
  /** Called when a thumb is released / changed by keyboard. Full range → null (no filter). */
  onCommit: (range: { min: number; max: number } | null) => void;
}

const thumb =
  "pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent outline-none " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-primary " +
  "focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-primary/20";

/** Two-thumb price range (two overlaid native range inputs, so it stays keyboard accessible). */
export function PriceSlider({ min, max, value, format, labels, onCommit }: PriceSliderProps) {
  const [range, setRange] = useState(value);
  const step = max - min > 5000 ? 100 : 10;
  const percent = (cents: number) => ((cents - min) / (max - min)) * 100;

  const commit = () => {
    const full = range.min <= min && range.max >= max;
    onCommit(full ? null : range);
  };

  return (
    <div className="space-y-4 pt-1">
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${percent(range.min)}%`, right: `${100 - percent(range.max)}%` }}
        />
        <input
          type="range"
          aria-label={labels.min}
          min={min}
          max={max}
          step={step}
          value={range.min}
          onChange={(e) =>
            setRange((r) => ({ ...r, min: Math.min(Number(e.target.value), r.max - step) }))
          }
          onPointerUp={commit}
          onKeyUp={commit}
          className={cn(thumb, range.min > max - step && "z-10")}
        />
        <input
          type="range"
          aria-label={labels.max}
          min={min}
          max={max}
          step={step}
          value={range.max}
          onChange={(e) =>
            setRange((r) => ({ ...r, max: Math.max(Number(e.target.value), r.min + step) }))
          }
          onPointerUp={commit}
          onKeyUp={commit}
          className={thumb}
        />
      </div>
      <div className="flex items-center justify-between text-sm tabular-nums text-foreground">
        <span>{format(range.min)}</span>
        <span>{format(range.max)}</span>
      </div>
    </div>
  );
}
