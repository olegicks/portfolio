"use client";

import { useSyncExternalStore } from "react";

/**
 * One render-quality level shared by every WebGL canvas on the page.
 *
 * Animations never change: only the resolution the canvases render at does. The level starts
 * from a guess based on the hardware and is then tuned from real frame times, so a slow laptop
 * settles on a resolution it can draw smoothly and a fast one keeps full detail.
 */

// Fraction of each canvas's full pixel ratio, from best to cheapest
const SCALES = [1, 0.85, 0.72, 0.6, 0.5, 0.42];
const MAX = SCALES.length - 1;

// From this level on, effects that are costly to composite over a moving canvas are dropped too
const LITE_FROM = 3;

let level = 0;
let initialized = false;

// Governor state
let warmup = 1.5;
let windowTime = 0;
let windowFrames = 0;
let fastWindows = 0;
let drops = 0;

const listeners = new Set<() => void>();

function set(next: number) {
  next = Math.min(MAX, Math.max(0, next));
  if (next === level) return;
  level = next;
  document.documentElement.toggleAttribute("data-lite", level >= LITE_FROM);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** The current scale (0..1] to apply to a canvas's pixel ratio. */
export function useQualityScale() {
  return useSyncExternalStore(
    subscribe,
    () => SCALES[level],
    () => SCALES[0],
  );
}

/** Pixel ratio for a canvas: the device's, capped, then scaled by the current level. */
export function canvasDpr(scale: number, cap: number, floor = 0.5) {
  const device = Math.min(window.devicePixelRatio || 1, cap);
  return Math.max(floor, device * scale);
}

/** Starting level from what the browser tells us about the machine. Runs once. */
export function initQuality(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  if (initialized) return;
  initialized = true;

  let start = 0;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.hardwareConcurrency ?? 8) <= 4) start++;
  if ((nav.deviceMemory ?? 8) <= 4) start++;

  // A software renderer (no usable GPU) needs the cheapest setting from the first frame
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = info
    ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
    : "";
  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer))
    start = MAX;

  set(start);
}

/**
 * Feeds frame times into the governor. Call it every frame from one canvas that always renders.
 * Frame times are averaged over one-second windows: a slow window steps quality down, and a run
 * of fast windows steps it back up. Each step down makes stepping up again more cautious, so the
 * level settles instead of bouncing between two settings.
 */
export function sampleFrame(delta: number) {
  // Skip stalls (tab switch, GC pause, shader compile): they say nothing about steady drawing
  if (delta > 0.25) return;
  if (warmup > 0) {
    warmup -= delta;
    return;
  }

  windowTime += delta;
  windowFrames++;
  if (windowTime < 1) return;

  const avg = windowTime / windowFrames;
  windowTime = 0;
  windowFrames = 0;

  // Under ~45 fps: step down right away
  if (avg > 1 / 45) {
    fastWindows = 0;
    if (level < MAX) {
      drops++;
      set(level + 1);
      // Give the canvas a moment to resize before judging the new level
      warmup = 0.5;
    }
    return;
  }

  // Close to the display's rate: after enough calm windows, try one step up
  if (avg < 1 / 55 && level > 0) {
    fastWindows++;
    if (fastWindows >= 3 + drops * 3) {
      fastWindows = 0;
      set(level - 1);
      warmup = 0.5;
    }
  } else {
    fastWindows = 0;
  }
}
