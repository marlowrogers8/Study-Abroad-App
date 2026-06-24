import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Differentiators } from "@/components/Differentiators";
import { HowItWorks } from "@/components/HowItWorks";
import { Destinations } from "@/components/Destinations";
import { FeaturedPrograms } from "@/components/FeaturedPrograms";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Differentiators />
        <FeaturedPrograms />
        <Destinations />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
