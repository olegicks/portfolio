import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import type { SceneDef } from "./types";

gsap.registerPlugin(DrawSVGPlugin);

// Seeded random, so the server and browser render identical points
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(7);
const AREA = { x0: 56, x1: 440, y0: 24, y1: 280 };
const sx = (miles: number) => AREA.x0 + (miles / 200000) * (AREA.x1 - AREA.x0);
const sy = (price: number) => AREA.y1 - (price / 60000) * (AREA.y1 - AREA.y0);
const trend = (miles: number) => 46000 * Math.exp(-miles / 65000) + 4500;

const POINTS = Array.from({ length: 72 }, () => {
  const miles = 5000 + rand() * 190000;
  const price = Math.min(trend(miles) * (0.78 + rand() * 0.44), 58000);
  return {
    x: +sx(miles).toFixed(1),
    y: +sy(price).toFixed(1),
    fromX: +(rand() * 400 - 200).toFixed(1),
    fromY: +(rand() * 300 - 150).toFixed(1),
  };
});

const CURVE = Array.from({ length: 41 }, (_, i) => {
  const miles = i * 5000;
  return `${i ? "L" : "M"}${sx(miles).toFixed(1)} ${sy(trend(miles)).toFixed(1)}`;
}).join(" ");

const X_TICKS = [
  { v: 0, label: "0" },
  { v: 100000, label: "100k" },
  { v: 200000, label: "200k mi" },
];
const Y_TICKS = [
  { v: 0, label: "$0" },
  { v: 30000, label: "$30k" },
  { v: 60000, label: "$60k" },
];

function View() {
  return (
    <div className="relative h-full">
      <svg viewBox="0 0 470 310" className="h-full w-full p-4">
        <line
          className="cp-axis"
          x1={AREA.x0}
          y1={AREA.y1}
          x2={AREA.x1}
          y2={AREA.y1}
          stroke="#7f98bc"
          strokeOpacity={0.4}
        />
        <line
          className="cp-axis"
          x1={AREA.x0}
          y1={AREA.y1}
          x2={AREA.x0}
          y2={AREA.y0}
          stroke="#7f98bc"
          strokeOpacity={0.4}
        />

        {X_TICKS.map((t) => (
          <text
            key={t.label}
            className="cp-tick"
            x={sx(t.v)}
            y={AREA.y1 + 20}
            textAnchor="middle"
            fill="#8a9ab3"
            fontSize={11}
          >
            {t.label}
          </text>
        ))}
        {Y_TICKS.map((t) => (
          <text
            key={t.label}
            className="cp-tick"
            x={AREA.x0 - 10}
            y={sy(t.v) + 4}
            textAnchor="end"
            fill="#8a9ab3"
            fontSize={11}
          >
            {t.label}
          </text>
        ))}

        {POINTS.map((p, i) => (
          <circle
            key={i}
            className="cp-pt"
            cx={p.x}
            cy={p.y}
            r={3}
            fill="#7f98bc"
            fillOpacity={0.75}
          />
        ))}

        <path
          className="cp-curve"
          d={CURVE}
          fill="none"
          stroke="#f2b33d"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </svg>

      <dl className="cp-stats absolute right-5 top-5 grid grid-cols-[auto_auto] gap-x-5 gap-y-1.5 rounded-xl bg-night/70 px-4 py-3 text-sm ring-1 ring-contour/20 backdrop-blur">
        <dt className="text-muted">Listings</dt>
        <dd className="cp-listings text-right font-mono tabular-nums">
          762,091
        </dd>
        <dt className="text-muted">R²</dt>
        <dd className="cp-r2 text-right font-mono tabular-nums text-signal">
          0.90
        </dd>
        <dt className="text-muted">MAE</dt>
        <dd className="cp-mae text-right font-mono tabular-nums">$3,204</dd>
      </dl>
    </div>
  );
}

function build(el: Element) {
  const q = gsap.utils.selector(el);
  const listings = q(".cp-listings")[0];
  const r2 = q(".cp-r2")[0];
  const mae = q(".cp-mae")[0];
  const n = { listings: 0, r2: 0, mae: 0 };

  const showListings = () =>
    (listings.textContent = Math.round(n.listings).toLocaleString("en-US"));
  const showR2 = () => (r2.textContent = n.r2.toFixed(2));
  const showMae = () =>
    (mae.textContent = `$${Math.round(n.mae).toLocaleString("en-US")}`);
  showListings();
  showR2();
  showMae();

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  tl.from(q(".cp-axis"), { drawSVG: 0, duration: 0.5, stagger: 0.1 })
    .from(q(".cp-tick"), { autoAlpha: 0, duration: 0.3, stagger: 0.03 }, "<0.2")
    .from(q(".cp-stats"), { autoAlpha: 0, y: -10, duration: 0.4 }, "<")
    // Raw listings fly in and settle into the data
    .from(
      q(".cp-pt"),
      {
        x: (i: number) => POINTS[i].fromX,
        y: (i: number) => POINTS[i].fromY,
        autoAlpha: 0,
        duration: 1,
        stagger: { each: 0.012, from: "random" },
        ease: "power3.out",
      },
      "<0.1",
    )
    .to(
      n,
      {
        listings: 762091,
        duration: 1.4,
        ease: "power1.out",
        onUpdate: showListings,
      },
      "<",
    )
    // The model's fit is drawn through them
    .from(q(".cp-curve"), { drawSVG: 0, duration: 1, ease: "power1.inOut" })
    .to(q(".cp-pt"), { fillOpacity: 0.35, duration: 0.6 }, "<")
    .to(n, { r2: 0.9022, duration: 0.8, onUpdate: showR2 }, "<0.4")
    .to(n, { mae: 3204, duration: 0.8, onUpdate: showMae }, "<0.1");

  return tl;
}

export const carScene: SceneDef = { View, build };
