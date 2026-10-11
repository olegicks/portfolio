"use client";

import { useLenis } from "lenis/react";
import { scrollState } from "./scrollState";

const DURATION = 1.6;

/**
 * Smooth-scrolls to a section by id ("top" for the page top).
 * When the scroll lands, it fires "section:arrive" so a project can play its scene.
 */
export function useScrollTo() {
  const lenis = useLenis();

  return (id: string) => {
    const el = id === "top" ? null : document.getElementById(id);
    if (id !== "top" && !el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Finish exactly once: when the scroll completes, or, if the user takes over with the
    // wheel mid-way (which cancels the scroll and its callback), after a short fallback.
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(fallback);
      scrollState.navigating = false;
      window.dispatchEvent(new CustomEvent("section:arrive", { detail: id }));
    };
    const fallback = setTimeout(finish, reduce ? 50 : DURATION * 1000 + 300);

    scrollState.navigating = true;
    if (lenis) {
      lenis.scrollTo(el ?? 0, {
        duration: DURATION,
        immediate: reduce,
        force: true,
        onComplete: finish,
      });
    } else {
      window.scrollTo({
        top: el ? el.getBoundingClientRect().top + window.scrollY : 0,
      });
      finish();
    }
  };
}
