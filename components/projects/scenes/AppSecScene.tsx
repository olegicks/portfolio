import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import type { SceneDef } from "./types";

gsap.registerPlugin(ScrambleTextPlugin);

const SECRET = "sk-live-4f9a2c71e0b8";

type Line = {
  code: string;
  finding?: { label: string; tone: "alert" | "contour" };
};

const LINES: Line[] = [
  { code: "import os, sqlite3" },
  { code: "" },
  {
    code: `API_KEY = "${SECRET}"`,
    finding: { label: "Secret redacted", tone: "contour" },
  },
  { code: "" },
  { code: "def get_user(conn, name):" },
  {
    code: `    q = f"SELECT * FROM users WHERE name='{name}'"`,
    finding: { label: "CWE-89 SQL injection", tone: "alert" },
  },
  { code: "    return conn.execute(q).fetchall()" },
  { code: "" },
  { code: "def backup(path):" },
  {
    code: `    os.system("tar -czf backup.tgz " + path)`,
    finding: { label: "CWE-78 Command injection", tone: "alert" },
  },
];

function renderCode(code: string) {
  if (!code.includes(SECRET)) return code || " ";
  const [before, after] = code.split(SECRET);
  return (
    <>
      {before}
      <span className="as-secret text-signal">{SECRET}</span>
      {after}
    </>
  );
}

function View() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-contour/15 px-5 py-3 text-xs text-muted">
        <span className="font-mono">app/users.py</span>
        <span>Bandit + AI review</span>
      </div>

      <div className="relative flex-1 overflow-hidden py-4 font-mono text-[clamp(9px,2.6vw,13px)] leading-[2.1] lg:text-[clamp(10px,1.05vw,13px)]">
        {LINES.map((line, i) => (
          <div key={i} className="as-line relative flex pr-4">
            {line.finding && (
              <span
                className={`as-hl as-hl-${i} absolute inset-0 origin-left border-l-2 ${
                  line.finding.tone === "alert"
                    ? "border-alert bg-alert/10"
                    : "border-contour bg-contour/10"
                }`}
              />
            )}
            <span className="relative w-10 shrink-0 select-none pr-3 text-right text-contour/45">
              {i + 1}
            </span>
            <span className="relative whitespace-pre text-paper/85">
              {renderCode(line.code)}
            </span>
            {line.finding && (
              <span
                className={`as-tag as-tag-${i} absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-panel px-2.5 py-0.5 font-sans text-[11px] ring-1 ${
                  line.finding.tone === "alert"
                    ? "text-alert ring-alert/40"
                    : "text-contour ring-contour/40"
                }`}
              >
                {line.finding.label}
              </span>
            )}
          </div>
        ))}
        <div className="as-scan pointer-events-none absolute inset-x-0 top-0 h-px bg-signal shadow-[0_0_18px_4px_rgba(242,179,61,0.45)]" />
      </div>

      <div className="as-summary flex flex-wrap gap-2 border-t border-contour/15 px-5 py-3 text-xs">
        <span className="rounded-full bg-alert/15 px-2.5 py-1 text-alert">
          2 high severity
        </span>
        <span className="rounded-full bg-contour/15 px-2.5 py-1 text-contour">
          1 secret redacted before AI review
        </span>
        <span className="rounded-full bg-paper/10 px-2.5 py-1 text-paper/80">
          OWASP: Injection
        </span>
      </div>
    </div>
  );
}

function build(el: Element) {
  const q = gsap.utils.selector(el);
  const SCAN = 3;
  const tl = gsap.timeline({ defaults: { ease: "none" } });

  tl.from(q(".as-line"), {
    autoAlpha: 0,
    x: -10,
    duration: 0.4,
    stagger: 0.04,
    ease: "power2.out",
  });

  // The scanner sweeps down the file and reacts to each finding as it passes
  const start = tl.duration();
  tl.fromTo(
    q(".as-scan"),
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.15 },
    start,
  );
  tl.fromTo(
    q(".as-scan"),
    { top: "0%" },
    { top: "100%", duration: SCAN },
    start,
  );

  LINES.forEach((line, i) => {
    if (!line.finding) return;
    const at = start + (SCAN * (i + 0.6)) / LINES.length;
    tl.fromTo(
      q(`.as-hl-${i}`),
      { scaleX: 0 },
      { scaleX: 1, duration: 0.35, ease: "power3.out" },
      at,
    );
    tl.from(
      q(`.as-tag-${i}`),
      { autoAlpha: 0, x: 14, duration: 0.3, ease: "power3.out" },
      at + 0.1,
    );
    if (line.code.includes(SECRET)) {
      tl.to(
        q(".as-secret"),
        {
          duration: 0.6,
          scrambleText: { text: "[REDACTED]", chars: "x#%&*01", speed: 0.5 },
        },
        at,
      );
    }
  });

  tl.to(q(".as-scan"), { autoAlpha: 0, duration: 0.2 }, start + SCAN);
  tl.from(
    q(".as-summary > *"),
    { autoAlpha: 0, y: 8, duration: 0.3, stagger: 0.08, ease: "power2.out" },
    start + SCAN,
  );

  return tl;
}

export const appsecScene: SceneDef = { View, build };
