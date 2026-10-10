"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Project } from "./data";
import { scenes } from "./scenes";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ProjectPanel({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null);
  const scene = scenes[project.scene];
  const SceneView = scene.View;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

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

          const tl = gsap.timeline();
          tl.from(
            el.querySelectorAll(".pp-reveal"),
            {
              y: 40,
              autoAlpha: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: "power3.out",
            },
            0,
          );
          tl.add(scene.build(el.querySelector(".pp-scene")!), 0.35);

          if (reduce) {
            tl.progress(1);
            return;
          }

          // Desktop: the panel pins and scrolling plays the scene.
          // Mobile: no pinning, the scene plays as the panel passes through.
          ScrollTrigger.create({
            trigger: el,
            animation: tl,
            start: desktop ? "top top" : "top 70%",
            end: desktop ? "+=160%" : "bottom 55%",
            pin: desktop,
            scrub: 0.8,
            anticipatePin: 1,
          });
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
          className="pp-scene relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-contour/20 bg-panel lg:aspect-auto lg:h-[min(74svh,580px)]"
          aria-hidden="true"
        >
          <SceneView />
        </div>
      </div>
    </article>
  );
}
