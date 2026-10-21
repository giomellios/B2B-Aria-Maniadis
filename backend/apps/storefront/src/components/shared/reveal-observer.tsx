"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const KEYFRAMES: Keyframe[] = [
  { opacity: 0.15, transform: "translateY(28px)" },
  { opacity: 1, transform: "none" },
];

/**
 * Entrance for marked elements: anything with `data-reveal` rises into place once, as it first
 * scrolls into view. It runs through the Web Animations API, so no class or attribute is ever
 * changed (nothing for React hydration to disagree with), and without script or with reduced
 * motion the content is simply there. `style={{ "--i": n }}` staggers siblings by n × 75ms.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.hasAttribute("data-locale-switch")) return;

    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const index = Number(getComputedStyle(entry.target).getPropertyValue("--i")) || 0;
          entry.target.animate(KEYFRAMES, {
            duration: 700,
            delay: index * 75,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "backwards",
          });
        }
      },
      { threshold: 0.01 }
    );
    const observe = () =>
      document.querySelectorAll("[data-reveal]").forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        // Already on screen when the page opens: leave it be.
        if (element.getBoundingClientRect().top < window.innerHeight) return;
        observer.observe(element);
      });
    observe();
    // Streamed sections (Suspense) arrive after the first pass.
    const mutations = new MutationObserver(observe);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
