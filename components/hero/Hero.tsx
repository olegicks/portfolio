"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP);

const FieldCanvas = dynamic(() => import("./FieldCanvas"), { ssr: false });

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const intro = useRef({ value: 0 });

  useGSAP(
    (_ctx, contextSafe) => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const build = contextSafe!(() => {
        gsap.set(root.current, { autoAlpha: 1 });

        if (reduce) {
          intro.current.value = 1;
          return;
        }

        const name = SplitText.create(".hero-name-line", { type: "chars" });
        const lead = SplitText.create(".hero-lead", {
          type: "lines",
          mask: "lines",
        });

        // Intro sequence
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(
            intro.current,
            { value: 1, duration: 2.8, ease: "power2.inOut" },
            0,
          )
          .from(
            name.chars,
            {
              yPercent: 120,
              rotate: 7,
              transformOrigin: "0% 100%",
              duration: 1.6,
              stagger: 0.04,
            },
            0.3,
          )
          .from(
            lead.lines,
            {
              yPercent: 105,
              duration: 1.3,
              stagger: 0.09,
              onComplete: () => lead.revert(),
            },
            1.05,
          )
          .from(
            ".hero-fade",
            { autoAlpha: 0, y: 16, duration: 1.1, stagger: 0.07 },
            1.25,
          );

        // Scroll exit
        const scrub = {
          trigger: root.current!,
          start: "top top",
          end: "bottom top",
          scrub: true,
        };
        gsap.to(".hero-name", {
          yPercent: -18,
          ease: "none",
          scrollTrigger: scrub,
        });
        gsap.to(".hero-meta", {
          y: -60,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { ...scrub, end: "45% top" },
        });
        gsap.to(".hero-canvas", {
          autoAlpha: 0.2,
          scale: 1.08,
          ease: "none",
          scrollTrigger: scrub,
        });
      });

      // Split text only after fonts load, so line breaks are measured correctly
      document.fonts.ready.then(build);
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="invisible relative h-[100svh] min-h-[620px] overflow-hidden"
    >
      <div className="hero-canvas absolute inset-0" aria-hidden="true">
        <FieldCanvas intro={intro} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-night/90 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-between px-[clamp(1.25rem,4vw,3.5rem)] pb-[clamp(1.5rem,4vh,3rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <header className="hero-fade flex items-center justify-between">
          <a
            href="#top"
            className="font-display text-xl font-semibold tracking-tight"
          >
            O.S.
          </a>
          <nav
            aria-label="Main"
            className="flex gap-6 text-sm text-muted sm:gap-8"
          >
            <a className="link-underline hover:text-paper" href="#projects">
              Projects
            </a>
            <a className="link-underline hover:text-paper" href="#about">
              About
            </a>
            <a className="link-underline hover:text-paper" href="#contact">
              Contact
            </a>
          </nav>
        </header>

        <div>
          <h1 className="hero-name font-display text-[clamp(3.5rem,15.5vw,16rem)] font-semibold leading-[0.84] tracking-[-0.05em]">
            {/* Each line clips its letters; the padding keeps descenders visible */}
            <span className="hero-name-line -mb-[0.12em] block overflow-hidden pb-[0.12em]">
              Oleh
            </span>
            <span className="hero-name-line -mb-[0.12em] block overflow-hidden pb-[0.12em]">
              Shynkaryk
            </span>
          </h1>

          <div className="hero-meta mt-8 grid gap-6 md:mt-10 md:grid-cols-[minmax(0,38ch)_1fr] md:items-end">
            <p className="hero-lead max-w-[38ch] text-lg leading-relaxed text-paper/85 md:text-xl">
              Computer science student at the University of Vienna. I build
              machine-learning apps, cloud tooling and AI-assisted security
              pipelines.
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm md:justify-end">
              <span className="hero-fade flex items-center gap-2.5 text-muted">
                <span className="status-dot" aria-hidden="true" />
                Open to internships in Vienna
              </span>
              <a
                className="hero-fade link-underline"
                href="https://github.com/olegicks"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <a className="hero-fade link-underline" href="#projects">
                See projects
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
