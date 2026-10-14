"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { projects } from "@/components/projects/data";
import { useScrollTo } from "./useScrollTo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const WORK = projects.map((p) => ({ id: p.slug, label: p.short }));
const PAGES = [
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];
const LINKS = [...WORK, ...PAGES];

export default function Nav() {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const go = useScrollTo();
  const lenis = useLenis();
  const list = useRef<HTMLUListElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // The bar appears once the hero is behind you
    ScrollTrigger.create({
      trigger: "#hero",
      start: "bottom 15%",
      endTrigger: document.documentElement,
      end: "bottom bottom",
      onToggle: (self) => setShown(self.isActive),
    });

    // Track which section is on screen
    LINKS.forEach(({ id }) => {
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: id === "contact" ? "top 80%" : "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) setActive(id);
          else setActive((cur) => (cur === id ? null : cur));
        },
      });
    });

    // Reading progress along the bottom edge of the bar
    gsap.fromTo(
      progress.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      },
    );
  });

  // Slide the highlight pill under the active link
  const placeIndicator = useCallback(() => {
    const ind = indicator.current;
    const link = active
      ? list.current?.querySelector<HTMLElement>(`[data-id="${active}"]`)
      : null;
    if (!ind) return;
    if (!link) {
      ind.style.opacity = "0";
      return;
    }
    ind.style.opacity = "1";
    ind.style.transform = `translateX(${link.offsetLeft}px)`;
    ind.style.width = `${link.offsetWidth}px`;
  }, [active]);

  useLayoutEffect(placeIndicator, [placeIndicator]);
  useEffect(() => {
    window.addEventListener("resize", placeIndicator);
    return () => window.removeEventListener("resize", placeIndicator);
  }, [placeIndicator]);

  // Mobile menu: freeze page scroll, close on Escape, stagger the links in
  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useGSAP(
    () => {
      if (!open) return;
      gsap.fromTo(
        ".mm-item",
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, stagger: 0.05, ease: "expo.out" },
      );
    },
    { dependencies: [open], scope: menu },
  );

  const navigate = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    go(id);
  };

  const activeLabel = LINKS.find((l) => l.id === active)?.label ?? "";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-contour/10 bg-night/70 pt-[env(safe-area-inset-top)] backdrop-blur-md lite-solid transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
          shown || open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="px-pad flex h-14 items-center justify-between gap-6">
          <a
            href="#top"
            onClick={navigate("top")}
            className="font-display text-lg font-semibold tracking-tight"
          >
            O.S.
          </a>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul ref={list} className="relative flex items-center text-sm">
              <span
                ref={indicator}
                aria-hidden="true"
                className="absolute left-0 top-0 h-full rounded-full bg-paper opacity-0 transition-[transform,width,opacity] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"
              />
              {WORK.map((l) => (
                <NavLink
                  key={l.id}
                  {...l}
                  active={active === l.id}
                  onClick={navigate(l.id)}
                />
              ))}
              <li aria-hidden="true" className="mx-3 h-4 w-px bg-contour/25" />
              {PAGES.map((l) => (
                <NavLink
                  key={l.id}
                  {...l}
                  active={active === l.id}
                  onClick={navigate(l.id)}
                />
              ))}
            </ul>
          </nav>

          <span className="min-w-0 flex-1 truncate text-center text-sm text-muted lg:hidden">
            {activeLabel}
          </span>
          <button
            type="button"
            className="text-sm lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
        <span
          ref={progress}
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-px w-full origin-left bg-signal"
        />
      </header>

      <div
        id="mobile-menu"
        ref={menu}
        inert={!open}
        className={`px-pad fixed inset-0 z-40 flex flex-col justify-center bg-night/95 backdrop-blur-lg lite-solid transition-opacity duration-500 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav aria-label="Sections">
          <p className="text-sm text-signal">Work</p>
          <ul className="mt-3">
            {WORK.map((l) => (
              <MenuLink
                key={l.id}
                {...l}
                active={active === l.id}
                onClick={navigate(l.id)}
              />
            ))}
          </ul>
          <ul className="mt-8">
            {PAGES.map((l) => (
              <MenuLink
                key={l.id}
                {...l}
                active={active === l.id}
                onClick={navigate(l.id)}
              />
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

type LinkProps = {
  id: string;
  label: string;
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
};

function NavLink({ id, label, active, onClick }: LinkProps) {
  return (
    <li>
      <a
        data-id={id}
        href={`#${id}`}
        onClick={onClick}
        aria-current={active ? "location" : undefined}
        className={`relative block rounded-full px-3.5 py-1.5 transition-colors duration-300 ${
          active ? "text-night" : "text-muted hover:text-paper"
        }`}
      >
        {label}
      </a>
    </li>
  );
}

function MenuLink({ id, label, active, onClick }: LinkProps) {
  return (
    <li className="overflow-hidden">
      <a
        href={`#${id}`}
        onClick={onClick}
        aria-current={active ? "location" : undefined}
        className={`mm-item block py-1 font-display text-[clamp(2rem,9vw,3rem)] font-semibold tracking-[-0.03em] ${
          active ? "text-signal" : ""
        }`}
      >
        {label}
      </a>
    </li>
  );
}
