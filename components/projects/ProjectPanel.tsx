"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { scrollState } from "@/components/nav/scrollState";
import type { Project } from "./data";
import { scenes } from "./scenes";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ProjectPanel({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null);
  const scene = scenes[project.scene];
  const SceneView = scene.View;
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const sceneEl = el.querySelector(".pp-scene")!;

      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 1024px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, reduce } = ctx.conditions as {
            desktop: boolean;
            reduce: boolean;
          };
          const tl = scene.build(sceneEl).pause();

          if (reduce) {
            tl.progress(1);
            return;
          }

          // Text reveals once, as the panel arrives
          gsap.from(el.querySelectorAll(".pp-reveal"), {
            y: 40,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.08,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 75%", once: true },
          });

          // The scene only ever moves forward: scrolling back up never replays it
          let reached = 0;
          let released = false;
          let pending = false;
          let st: ScrollTrigger | undefined;

          const advance = (p: number, duration = 1) => {
            if (p <= reached) return;
            reached = p;
            gsap.to(tl, {
              progress: p,
              duration,
              ease: "power2.out",
              overwrite: true,
            });
          };

          // Once the scene has played, drop the pin so the panel scrolls like normal content
          // in both directions. Removing the pin spacer shortens the page above the viewport,
          // so the scroll position is shifted by the same amount in the same frame: no visible jump.
          const release = () => {
            if (!desktop || released) return;
            if (scrollState.navigating) {
              // Don't disturb a navigation scroll in progress; finish after it lands
              pending = true;
              return;
            }
            pending = false;
            requestAnimationFrame(() => {
              if (released || !st) return;
              const l = lenisRef.current;
              const current = l ? l.animatedScroll : window.scrollY;

              // Still inside the pinned stretch: try again when the user leaves it
              if (current > st.start + 1 && current < st.end - 1) {
                pending = true;
                return;
              }

              released = true;
              const dist = st.end - st.start;
              const target = l ? l.targetScroll : current;
              const isAbove = current >= st.end - 1;

              st.kill(true);

              if (isAbove) {
                if (l) {
                  l.scrollTo(current - dist, { immediate: true, force: true });
                  // Keep any scroll momentum the user still had
                  if (Math.abs(target - current) > 1)
                    l.scrollTo(target - dist, { force: true });
                } else {
                  window.scrollTo(0, current - dist);
                }
              }
              ScrollTrigger.refresh();
            });
          };

          // Desktop: the panel pins while the scene plays. Mobile: no pinning.
          st = ScrollTrigger.create({
            trigger: el,
            start: desktop ? "top top" : "top 75%",
            end: desktop ? "+=150%" : "bottom 60%",
            pin: desktop,
            anticipatePin: 1,
            onUpdate: (self) => advance(self.progress),
            onLeave: () => {
              advance(1, 0.8);
              release();
            },
            onLeaveBack: () => {
              if (reached >= 1) release();
            },
          });

          const onArrive = (e: Event) => {
            if ((e as CustomEvent<string>).detail === project.slug)
              advance(1, 2.4);
            if (pending) release();
          };
          window.addEventListener("section:arrive", onArrive);
          return () => window.removeEventListener("section:arrive", onArrive);
        },
      );
    },
    { scope: root },
  );

  return (
    <article
      ref={root}
      aria-labelledby={`${project.slug}-title`}
      className="relative flex min-h-[100svh] items-center px-[clamp(1.25rem,4vw,3.5rem)] py-16 lg:py-10"
    >
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div>
          <p className="pp-reveal text-sm text-signal">{project.kind}</p>
          <h3
            id={`${project.slug}-title`}
            className="pp-reveal mt-3 font-display text-[clamp(2.1rem,4.2vw,4rem)] font-semibold leading-[0.95] tracking-[-0.035em]"
          >
            {project.title}
          </h3>
          <p className="pp-reveal mt-6 max-w-[48ch] text-base leading-relaxed text-paper/75 md:text-lg">
            {project.summary}
          </p>
          <ul
            className="pp-reveal mt-6 flex flex-wrap gap-2"
            aria-label="Technologies"
          >
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-contour/25 px-3 py-1 text-sm text-muted"
              >
                {tech}
              </li>
            ))}
          </ul>
          <div className="pp-reveal mt-8 flex gap-8 text-sm">
            <a
              className="link-underline"
              href={project.live}
              target="_blank"
              rel="noreferrer"
            >
              Open live demo
            </a>
            <a
              className="link-underline text-muted hover:text-paper"
              href={project.repo}
              target="_blank"
              rel="noreferrer"
            >
              View source
            </a>
          </div>
        </div>

        <div
          className="pp-scene relative aspect-[4/5] w-full sm:aspect-[4/3] overflow-hidden rounded-2xl border border-contour/20 bg-panel lg:aspect-auto lg:h-[min(74svh,580px)]"
          aria-hidden="true"
        >
          <SceneView />
        </div>
      </div>
    </article>
  );
}
