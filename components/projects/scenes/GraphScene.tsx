import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import type { SceneDef } from "./types";

gsap.registerPlugin(DrawSVGPlugin);

type Node = { id: string; label: string; x: number; y: number; depth: number };

const NODES: Node[] = [
  { id: "main", label: "main.py", x: 70, y: 150, depth: 0 },
  { id: "routes", label: "routes.py", x: 200, y: 70, depth: 1 },
  { id: "services", label: "services.py", x: 210, y: 170, depth: 1 },
  { id: "config", label: "config.py", x: 190, y: 260, depth: 1 },
  { id: "models", label: "models.py", x: 345, y: 40, depth: 2 },
  { id: "auth", label: "auth.py", x: 355, y: 120, depth: 2 },
  { id: "db", label: "db.py", x: 365, y: 200, depth: 2 },
  { id: "utils", label: "utils.py", x: 340, y: 270, depth: 2 },
];

const EDGES: [string, string][] = [
  ["main", "routes"],
  ["main", "services"],
  ["main", "config"],
  ["routes", "models"],
  ["routes", "auth"],
  ["services", "auth"],
  ["services", "db"],
  ["services", "utils"],
  ["config", "utils"],
];

const SELECTED = "routes";
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

function edgePath(a: Node, b: Node) {
  const mx = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
}

const LANGS = [
  { name: "Python", share: 64, color: "bg-contour" },
  { name: "JavaScript", share: 28, color: "bg-signal" },
  { name: "CSS", share: 8, color: "bg-paper/40" },
];

function View() {
  const sel = byId[SELECTED];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-contour/15 px-5 py-3 text-xs text-muted">
        <span>Dependency graph</span>
        <span className="font-mono">8 files, 9 imports</span>
      </div>

      <div className="relative min-h-0 flex-1">
        <svg viewBox="0 0 440 310" className="h-full w-full p-4">
          {EDGES.map(([from, to]) => {
            const hot = from === SELECTED || to === SELECTED;
            return (
              <path
                key={`${from}-${to}`}
                d={edgePath(byId[from], byId[to])}
                className={`gr-edge gr-edge-d${byId[to].depth} ${hot ? "gr-edge-hot" : ""}`}
                fill="none"
                stroke="#7f98bc"
                strokeOpacity={0.55}
                strokeWidth={1.4}
              />
            );
          })}

          <circle
            className="gr-ring"
            cx={sel.x}
            cy={sel.y}
            r={15}
            fill="none"
            stroke="#f2b33d"
            strokeWidth={1.5}
          />

          {NODES.map((n) => (
            <g key={n.id} className={`gr-node gr-node-d${n.depth}`}>
              <circle
                cx={n.x}
                cy={n.y}
                r={n.depth === 0 ? 8 : 6}
                fill={n.id === SELECTED ? "#f2b33d" : "#e9eef5"}
              />
              <text
                x={n.x}
                y={n.y + 22}
                textAnchor="middle"
                fill="#8a9ab3"
                fontSize={11}
                fontFamily="ui-monospace, monospace"
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>

        <div className="gr-card absolute bottom-3 left-5 rounded-xl bg-night/80 px-4 py-3 text-xs ring-1 ring-signal/40 backdrop-blur">
          <p className="font-mono text-sm text-signal">routes.py</p>
          <p className="mt-1 text-paper/75">6 functions, 3 imports</p>
          <p className="text-muted">4 API endpoints</p>
        </div>
      </div>

      <div className="border-t border-contour/15 px-5 py-4">
        <div className="gr-bar flex h-2 overflow-hidden rounded-full">
          {LANGS.map((l) => (
            <span
              key={l.name}
              className={l.color}
              style={{ width: `${l.share}%` }}
            />
          ))}
        </div>
        <div className="gr-legend mt-3 flex gap-5 text-xs text-muted">
          {LANGS.map((l) => (
            <span key={l.name} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${l.color}`} />
              {l.name} {l.share}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function build(el: Element) {
  const q = gsap.utils.selector(el);
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  // The graph grows outward, one dependency level at a time
  [0, 1, 2].forEach((depth) => {
    if (depth > 0) {
      tl.from(
        q(`.gr-edge-d${depth}`),
        { drawSVG: 0, duration: 0.6, stagger: 0.07, ease: "power1.inOut" },
        depth === 1 ? ">" : ">-0.1",
      );
    }
    tl.from(
      q(`.gr-node-d${depth}`),
      {
        scale: 0,
        autoAlpha: 0,
        transformOrigin: "50% 50%",
        duration: 0.45,
        stagger: 0.06,
        ease: "back.out(2)",
      },
      ">-0.15",
    );
  });

  // Then a file gets inspected
  tl.fromTo(
    q(".gr-ring"),
    { scale: 0.3, autoAlpha: 0, transformOrigin: "50% 50%" },
    { scale: 1, autoAlpha: 1, duration: 0.4 },
    "+=0.2",
  )
    .to(
      q(".gr-edge-hot"),
      { attr: { stroke: "#f2b33d" }, strokeOpacity: 1, duration: 0.4 },
      "<",
    )
    .from(q(".gr-card"), { autoAlpha: 0, y: 12, duration: 0.4 }, "<0.1")
    .from(
      q(".gr-bar"),
      {
        scaleX: 0,
        transformOrigin: "0% 50%",
        duration: 0.8,
        ease: "power3.inOut",
      },
      "+=0.1",
    )
    .from(
      q(".gr-legend > *"),
      { autoAlpha: 0, y: 6, duration: 0.3, stagger: 0.06 },
      "<0.3",
    );

  return tl;
}

export const graphScene: SceneDef = { View, build };
