import type { ReactElement } from "react";

export type SceneDef = {
  View: () => ReactElement;
  /** Builds the scene's timeline. The panel scrubs it with scroll. */
  build: (el: Element) => gsap.core.Timeline;
};
