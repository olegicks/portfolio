import { projects } from "./data";
import ProjectPanel from "./ProjectPanel";

export default function Projects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="relative"
    >
      <div className="px-[clamp(1.25rem,4vw,3.5rem)] pt-[clamp(5rem,14vh,9rem)]">
        <h2
          id="projects-title"
          className="font-display text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-[0.9] tracking-[-0.04em]"
        >
          Selected work
        </h2>
        <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-paper/70">
          Four projects, each built and deployed end to end, from the data and
          the API to the interface.
        </p>
      </div>

      {projects.map((project) => (
        <ProjectPanel key={project.slug} project={project} />
      ))}
    </section>
  );
}
