"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP);

/**
 * One-time scroll reveals inside a section:
 *  .reveal-lines  text rises line by line from a mask
 *  .reveal-item   fades up, in batches as items enter
 *  .reveal-draw   a vertical rule draws downward
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (
        !root ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;

      root.querySelectorAll<HTMLElement>(".reveal-lines").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              duration: 1.1,
              stagger: 0.08,
              ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            }),
        });
      });

      const items = root.querySelectorAll(".reveal-item");
      if (items.length) {
        gsap.set(items, { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(items, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.07,
              ease: "expo.out",
            }),
        });
      }

      root.querySelectorAll(".reveal-draw").forEach((el) => {
        gsap.from(el, {
          scaleY: 0,
          transformOrigin: "50% 0%",
          duration: 1.6,
          ease: "expo.inOut",
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        });
      });
    },
    { scope },
  );
}
