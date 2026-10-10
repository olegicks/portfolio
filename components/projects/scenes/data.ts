export type SceneKey = "appsec" | "graph" | "car" | "cloud";

export type Project = {
  slug: string;
  kind: string;
  title: string;
  summary: string;
  stack: string[];
  live: string;
  repo: string;
  scene: SceneKey;
};

export const projects: Project[] = [
  {
    slug: "ai-appsec-reviewer",
    kind: "Application security",
    title: "AI AppSec Code Reviewer",
    summary:
      "A hybrid security pipeline that runs Bandit static analysis and an LLM reviewer over a code snippet or a whole GitHub repository, then classifies findings by CWE and OWASP. Secrets are redacted before anything reaches the model, and submitted code is treated as untrusted to resist prompt injection.",
    stack: [
      "Python",
      "FastAPI",
      "Pydantic",
      "Bandit",
      "OpenAI",
      "React",
      "Monaco",
    ],
    live: "https://ai-appsec-reviewer-7qgg.vercel.app/",
    repo: "https://github.com/olegicks/ai-appsec-reviewer",
    scene: "appsec",
  },
  {
    slug: "github-project-analyst",
    kind: "Developer tooling",
    title: "GitHub Project Analyst",
    summary:
      "Paste a public repository URL and get a compact technical overview: detected languages and technologies, an interactive dependency graph of the source files, and an AI analysis built only from facts the analyzer collected.",
    stack: ["Python", "FastAPI", "GitPython", "OpenAI", "React", "React Flow"],
    live: "https://github-project-analyst.vercel.app/",
    repo: "https://github.com/olegicks/github-project-analyst",
    scene: "graph",
  },
  {
    slug: "car-price-predictor",
    kind: "Machine learning",
    title: "Car Price Predictor",
    summary:
      "An end-to-end ML application trained on 762,091 real used-car listings. I cleaned the data, engineered features and trained a CatBoost regressor (R² 0.90, MAE about $3,200), then served it through a FastAPI backend and a React interface.",
    stack: ["Python", "Pandas", "CatBoost", "scikit-learn", "FastAPI", "React"],
    live: "https://car-price-predictor-ebon.vercel.app/",
    repo: "https://github.com/olegicks/car-price-predictor",
    scene: "car",
  },
  {
    slug: "cloudops-dashboard",
    kind: "Cloud and DevOps",
    title: "CloudOps Dashboard",
    summary:
      "A FastAPI service running in Docker on a Microsoft Azure VM, with a dashboard for CPU, RAM, uptime and deployment info. Simulate a failure and watch Docker health checks bring the container back on their own.",
    stack: [
      "Docker",
      "Docker Compose",
      "Azure VM",
      "Linux",
      "FastAPI",
      "React",
    ],
    live: "https://cloudops-dashboard-wheat.vercel.app/",
    repo: "https://github.com/olegicks/cloudops-dashboard",
    scene: "cloud",
  },
];
