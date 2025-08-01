import React from "react";
import Navigation from "../components/navigation";
import Hero from "../components/hero";
import Features from "../components/features";
import PerfumeCatalog from "../components/perfume-catalog";
import Collections from "../components/collections";
import SocialMedia from "../components/social-media";
import Footer from "../components/footer";
import { HomeSEO } from "../components/seo";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <HomeSEO />
      <Navigation />
      <Hero />
      <Features />
      <PerfumeCatalog />
      <Collections />
      <SocialMedia />
      <Footer />
    </div>
  );
}
