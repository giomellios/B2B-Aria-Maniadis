"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export interface OrderStep {
  title: string;
  text: string;
  photo: string;
  alt: string;
}

// Empty space between each step's text and its photograph, varied so the photographs rise and fall.
const GAPS = ["md:mt-24", "md:mt-10", "md:mt-32", "md:mt-16", "md:mt-28", "md:mt-12"];
const PHONE_GAPS = ["mt-10", "mt-6", "mt-14", "mt-8", "mt-12", "mt-6"];

/**
 * The ordering story told left to right. On a phone it is a swipe row with a progress bar; from
 * tablet up every step fits on screen, so nothing is cut at the edge.
 */
export function OrderSteps({
  title,
  steps,
  labels,
}: {
  title: string;
  steps: OrderStep[];
  labels: { progress: string };
}) {
  const row = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0);

  const onScroll = () => {
    const el = row.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 1);
  };

  return (
    <section aria-labelledby="steps-title" className="mt-36 md:mt-52">
      <div className="flex items-end justify-between gap-6 px-4 sm:px-5">
        <h2
          id="steps-title"
          data-reveal
          className="text-[clamp(2rem,1.3rem+3.2vw,4rem)] font-semibold leading-none tracking-[-0.02em]"
        >
          {title}
        </h2>
      </div>
      <div
        role="progressbar"
        aria-label={labels.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="mx-4 mt-8 h-1.5 overflow-hidden rounded-full bg-card sm:mx-5 md:hidden"
      >
        <div
          className="h-full origin-left bg-foreground transition-transform duration-150"
          style={{ transform: `scaleX(${Math.max(progress, 0.08)})` }}
        />
      </div>
      <ol
        ref={row}
        onScroll={onScroll}
        className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 [scrollbar-width:none] sm:scroll-px-5 sm:px-5 md:mt-12 md:grid md:grid-cols-3 md:gap-x-5 md:gap-y-16 md:overflow-visible md:pb-0 lg:grid-cols-6"
      >
        {steps.map((item, i) => (
          <li
            key={item.title}
            data-reveal
            style={{ "--i": i } as React.CSSProperties}
            className="w-[72vw] shrink-0 snap-start md:w-auto"
          >
            <h3 className="text-base font-semibold leading-tight">{item.title}</h3>
            <p className="mt-2 text-base leading-[1.45]">{item.text}</p>
            <div
              className={`${PHONE_GAPS[i % PHONE_GAPS.length]} ${GAPS[i % GAPS.length]} overflow-hidden rounded-lg`}
            >
              <Image
                src={item.photo}
                alt={item.alt}
                width={560}
                height={700}
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 32vw, 72vw"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
