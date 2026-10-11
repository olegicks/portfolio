"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReveal } from "@/components/motion/useReveal";
import { useScrollTo } from "@/components/nav/useScrollTo";

const EMAIL = "sholeg2005@gmail.com";

const LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/oleh-shynkaryk-090134283/",
  },
  { label: "GitHub", href: "https://github.com/olegicks" },
];

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const go = useScrollTo();

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: the mailto link still works */
    }
  };

  // Local time in Vienna, rendered after mount to avoid a hydration mismatch
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Vienna",
      hour: "2-digit",
      minute: "2-digit",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const button =
    "reveal-item rounded-full border border-contour/30 px-5 py-2.5 text-sm transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-night";

  return (
    <section
      id="contact"
      ref={root}
      aria-labelledby="contact-title"
      className="px-pad relative pb-8 pt-[clamp(6rem,16vh,10rem)]"
    >
      <div className="mx-auto max-w-[1400px]">
        <h2
          id="contact-title"
          className="reveal-lines font-display text-[clamp(2.75rem,9vw,8rem)] font-semibold leading-[0.92] tracking-[-0.045em]"
        >
          Let&apos;s talk.
        </h2>
        <p className="reveal-lines mt-6 max-w-[46ch] text-lg leading-relaxed text-paper/75 md:text-xl">
          I&apos;m looking for internships and student roles in Vienna, in
          backend development, security, data or AI. Email is the quickest way
          to reach me.
        </p>

        <a
          href={`mailto:${EMAIL}`}
          aria-label={`Email ${EMAIL}`}
          className="email-roll reveal-item mt-14 inline-block break-all font-display text-[clamp(1.4rem,5vw,4.5rem)] font-semibold tracking-[-0.03em]"
        >
          {EMAIL.split("").map((c, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="roll-char"
              style={{ "--i": i } as CSSProperties}
            >
              <span>{c}</span>
              <span className="text-signal">{c}</span>
            </span>
          ))}
        </a>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copy}
            className={button}
            aria-live="polite"
          >
            {copied ? "Copied" : "Copy email"}
          </button>
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className={button}
            >
              {l.label}
            </a>
          ))}
          <a href="/cv.pdf" download className={button}>
            Download CV
          </a>
        </div>

        <footer className="mt-[clamp(6rem,14vh,9rem)] flex flex-wrap items-center justify-between gap-4 border-t border-contour/15 pt-6 text-sm text-muted">
          <span>© 2026 Oleh Shynkaryk</span>
          <span>Vienna{time ? `, ${time}` : ""}</span>
          <a
            href="#top"
            className="link-underline hover:text-paper"
            onClick={(e) => {
              e.preventDefault();
              go("top");
            }}
          >
            Back to top
          </a>
        </footer>
      </div>
    </section>
  );
}
