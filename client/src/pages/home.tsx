import Navigation from "@/components/navigation";
import Hero from "@/components/hero";
import Features from "@/components/features";
import PerfumeCatalog from "@/components/perfume-catalog";
import Collections from "@/components/collections";
import About from "@/components/about";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <Hero />
      <Features />
      <PerfumeCatalog />
      <Collections />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
