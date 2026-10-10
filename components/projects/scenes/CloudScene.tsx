import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import type { SceneDef } from "./types";

gsap.registerPlugin(DrawSVGPlugin);

// Heartbeat segments: healthy, crash, recovered
function beats(x0: number, x1: number, y: number) {
  let d = "";
  for (let x = x0; x + 40 <= x1; x += 40) {
    d += ` L${x + 14} ${y} L${x + 18} ${y - 26} L${x + 23} ${y + 18} L${x + 27} ${y} L${x + 40} ${y}`;
  }
  return d;
}
const HEALTHY = `M0 60${beats(0, 200, 60)}`;
const CRASH = "M200 60 L212 60 L218 98 L300 98";
const RECOVERED = `M300 98 L308 60${beats(308, 480, 60)}`;

const pill =
  "absolute right-0 top-0 flex items-center gap-2 rounded-full px-3 py-1 text-xs";

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper/10">
        <div
          className="cl-bar h-full origin-left rounded-full bg-contour"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function View() {
  return (
    <div className="flex h-full flex-col gap-6 p-5 sm:p-7">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg font-semibold">api-service</p>
          <p className="text-xs text-muted">Docker container on an Azure VM</p>
        </div>
        <div className="relative h-7 w-32">
          <span className={`cl-st-ok ${pill} bg-ok/15 text-ok`}>
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            Healthy
          </span>
          <span
            className={`cl-st-down ${pill} bg-alert/15 text-alert opacity-0`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-alert" />
            Unhealthy
          </span>
          <span
            className={`cl-st-restart ${pill} bg-signal/15 text-signal opacity-0`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            Restarting
          </span>
          <span className={`cl-st-ok2 ${pill} bg-ok/15 text-ok opacity-0`}>
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            Healthy
          </span>
        </div>
      </div>

      <svg viewBox="0 0 480 120" className="w-full">
        {[30, 60, 90].map((y) => (
          <line
            key={y}
            x1={0}
            x2={480}
            y1={y}
            y2={y}
            stroke="#7f98bc"
            strokeOpacity={0.1}
          />
        ))}
        <path
          className="cl-a"
          d={HEALTHY}
          fill="none"
          stroke="#6fd1a8"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          className="cl-b"
          d={CRASH}
          fill="none"
          stroke="#ef6b5b"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          className="cl-c"
          d={RECOVERED}
          fill="none"
          stroke="#6fd1a8"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>

      <div className="grid grid-cols-2 gap-6">
        <Bar label="CPU" value={34} />
        <Bar label="RAM" value={58} />
      </div>

      <div className="mt-auto flex items-center justify-between gap-4">
        <span className="cl-btn rounded-full border border-alert/50 px-4 py-2 text-sm text-alert">
          Simulate failure
        </span>
        <div className="relative h-5 flex-1 font-mono text-xs">
          <span className="cl-log-fail absolute right-0 top-0 text-alert opacity-0">
            health check failed
          </span>
          <span className="cl-log-ok absolute right-0 top-0 text-ok opacity-0">
            container restarted
          </span>
        </div>
      </div>
    </div>
  );
}

function build(el: Element) {
  const q = gsap.utils.selector(el);
  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  // Running normally
  tl.from(q(".cl-a"), { drawSVG: 0, duration: 1.4, ease: "none" })
    .from(q(".cl-bar"), { scaleX: 0, duration: 0.6, stagger: 0.1 }, 0.2)

    // Failure is triggered
    .to(
      q(".cl-btn"),
      { scale: 0.92, duration: 0.15, yoyo: true, repeat: 1 },
      ">",
    )
    .to(
      q(".cl-btn"),
      { backgroundColor: "rgba(239,107,91,0.18)", duration: 0.2 },
      "<",
    )
    .to(q(".cl-st-ok"), { opacity: 0, duration: 0.2 }, ">-0.05")
    .to(q(".cl-st-down"), { opacity: 1, duration: 0.2 }, "<")
    .fromTo(
      q(".cl-b"),
      { drawSVG: 0 },
      { drawSVG: "100%", duration: 0.8, ease: "none" },
      "<",
    )
    .to(q(".cl-bar"), { scaleX: 0.04, duration: 0.4 }, "<")
    .to(q(".cl-log-fail"), { opacity: 1, duration: 0.2 }, "<0.2")

    // Docker restarts the container
    .to(q(".cl-st-down"), { opacity: 0, duration: 0.2 }, ">")
    .to(q(".cl-st-restart"), { opacity: 1, duration: 0.2 }, "<")
    .to(q(".cl-st-restart"), { opacity: 0, duration: 0.2 }, "+=0.4")
    .to(q(".cl-st-ok2"), { opacity: 1, duration: 0.2 }, "<")
    .to(
      q(".cl-btn"),
      { backgroundColor: "rgba(239,107,91,0)", duration: 0.2 },
      "<",
    )
    .to(q(".cl-log-fail"), { opacity: 0, duration: 0.2 }, "<")
    .to(q(".cl-log-ok"), { opacity: 1, duration: 0.2 }, "<")
    .fromTo(
      q(".cl-c"),
      { drawSVG: 0 },
      { drawSVG: "100%", duration: 1.2, ease: "none" },
      "<",
    )
    .to(q(".cl-bar"), { scaleX: 1, duration: 0.6 }, "<");

  return tl;
}

export const cloudScene: SceneDef = { View, build };
