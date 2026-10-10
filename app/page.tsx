import Hero from "@/components/hero/Hero";
import Projects from "@/components/projects/Projects";

export default function Home() {
  return (
    <main id="top">
      <Hero />
      <Projects />

      {/* Temporary: About and Contact come next */}
      <section
        id="about"
        className="flex min-h-[60vh] items-center justify-center text-muted"
      >
        About and contact come next
      </section>
    </main>
  );
}
