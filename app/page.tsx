import Background from "@/components/background/Background";
import Hero from "@/components/hero/Hero";
import Projects from "@/components/projects/Projects";
import About from "@/components/about/About";
import Contact from "@/components/contact/Contact";
import Nav from "@/components/nav/Nav";

export default function Home() {
  return (
    <>
      <Background />
      <main id="top">
        <Hero />
        <Projects />
        <About />
        <Contact />
      </main>
      {/* Rendered last so it measures sections after their pins exist */}
      <Nav />
    </>
  );
}
