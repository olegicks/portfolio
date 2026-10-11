"use client";

import { useRef } from "react";
import { useReveal } from "@/components/motion/useReveal";

const EXPERIENCE = [
  {
    when: "Jul – Aug 2026",
    role: "IT Infrastructure Intern",
    where: "Boehringer Ingelheim, Vienna",
    note: "Reviewed and reconciled structured records in ServiceNow, used internal reports on IT assets, and supported IT onboarding and day-to-day operations.",
  },
  {
    when: "2023",
    role: "Customer Service, full time",
    where: "Do & Co, Vienna",
  },
];

const EDUCATION = [
  {
    when: "Mar 2024 – 2027 (expected)",
    role: "BSc Computer Science",
    where: "University of Vienna",
    note: "Electives focused on software engineering and software architecture.",
  },
  {
    when: "Course",
    role: "Python / Django Track",
    where: "Mate Academy",
    note: "Hands-on backend training: Python projects and REST APIs, plus HTML, CSS and JavaScript.",
  },
];

const SKILLS = [
  {
    group: "Programming",
    items: ["Python", "Java", "C++", "JavaScript", "TypeScript", "SQL"],
  },
  {
    group: "Backend",
    items: [
      "FastAPI",
      "Django",
      "Django REST Framework",
      "REST APIs",
      "Pydantic",
    ],
  },
  {
    group: "Security",
    items: [
      "Application security",
      "SAST",
      "Bandit",
      "OWASP",
      "CWE",
      "Secret detection",
      "Rate limiting",
    ],
  },
  {
    group: "Data",
    items: ["Pandas", "NumPy", "Jupyter", "CatBoost", "scikit-learn", "Excel"],
  },
  {
    group: "Frontend",
    items: ["React", "Vite", "Monaco Editor", "React Flow"],
  },
  {
    group: "Infrastructure",
    items: ["Docker", "Docker Compose", "Linux", "Azure", "Git", "GitHub"],
  },
  { group: "Databases", items: ["PostgreSQL", "SQLite"] },
];

const LANGUAGES = [
  { name: "Ukrainian", level: "Native" },
  { name: "German", level: "C1" },
  { name: "English", level: "C1" },
  { name: "Russian", level: "C1" },
];

type Entry = { when: string; role: string; where: string; note?: string };

function Timeline({ title, items }: { title: string; items: Entry[] }) {
  return (
    <div>
      <h3 className="reveal-item text-sm text-signal">{title}</h3>
      <ol className="relative mt-6 space-y-9 pl-6">
        <span
          aria-hidden="true"
          className="reveal-draw absolute bottom-1 left-0 top-1 w-px bg-contour/30"
        />
        {items.map((it) => (
          <li key={it.role} className="reveal-item relative">
            <span
              aria-hidden="true"
              className="absolute -left-[27px] top-[7px] h-[7px] w-[7px] rounded-full bg-signal"
            />
            <p className="text-sm text-muted">{it.when}</p>
            <p className="mt-1 font-display text-xl font-semibold tracking-[-0.01em]">
              {it.role}
            </p>
            <p className="text-paper/70">{it.where}</p>
            {it.note && (
              <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted">
                {it.note}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function About() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section
      id="about"
      ref={root}
      aria-labelledby="about-title"
      className="px-pad py-[clamp(6rem,16vh,10rem)]"
    >
      <div className="mx-auto max-w-[1400px]">
        <h2
          id="about-title"
          className="reveal-lines font-display text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.04em]"
        >
          About
        </h2>

        <div className="mt-12 grid gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-24">
          <div>
            <div className="space-y-6 text-[clamp(1.15rem,1.6vw,1.45rem)] leading-relaxed text-paper/85">
              <p className="reveal-lines">
                I&apos;m a Computer Science student in my sixth semester at the
                University of Vienna, expecting to graduate in 2027. What
                interests me most is how software is structured, shipped and
                kept running: I build Python backends, split them into clear
                modules, containerize them and deploy them to the cloud, and I
                like wiring LLMs into pipelines where they do something useful.
              </p>
              <p className="reveal-lines">
                This summer I interned in IT infrastructure at Boehringer
                Ingelheim in Vienna, working with structured company data in
                ServiceNow, internal reports on IT assets, and IT onboarding. I
                work carefully, enjoy picking up new technology, and work
                comfortably in German, English, Ukrainian and Russian.
              </p>
            </div>

            <div className="mt-16">
              <h3 className="reveal-item text-sm text-signal">Toolbox</h3>
              <div className="mt-6 space-y-5">
                {SKILLS.map((s) => (
                  <div
                    key={s.group}
                    className="reveal-item grid gap-2 sm:grid-cols-[8.5rem_1fr]"
                  >
                    <p className="pt-1 text-sm text-muted">{s.group}</p>
                    <ul className="flex flex-wrap gap-2">
                      {s.items.map((item) => (
                        <li
                          key={item}
                          className="rounded-full border border-contour/25 px-3 py-1 text-sm text-paper/80 transition-colors duration-300 hover:border-signal/60 hover:text-paper"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-14">
            <Timeline title="Experience" items={EXPERIENCE} />
            <Timeline title="Education" items={EDUCATION} />
            <div>
              <h3 className="reveal-item text-sm text-signal">Languages</h3>
              <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:grid-cols-2">
                {LANGUAGES.map((l) => (
                  <div key={l.name} className="reveal-item">
                    <dt className="font-display text-lg font-semibold">
                      {l.name}
                    </dt>
                    <dd className="text-sm text-muted">{l.level}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
