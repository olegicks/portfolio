import Hero from "@/components/hero/Hero";

export default function Home() {
  return (
    <main id="top">
      <Hero />

      {/* Temporary: gives the page room to scroll so you can test the hero exit */}
      <section
        id="projects"
        className="flex min-h-screen items-center justify-center text-muted"
      >
        Projects section comes next
      </section>
    </main>
  );
}
