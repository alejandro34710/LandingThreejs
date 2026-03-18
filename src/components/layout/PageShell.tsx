import Navbar from "./Navbar";
import DifferentiatorSection from "../sections/DifferentiatorSection";
import FeaturesSection from "../sections/FeaturesSection";
import FinalCTASection from "../sections/FinalCTASection";
import HeroSection from "../sections/HeroSection";
import ManifestSection from "../sections/ManifestSection";
import StorySection from "../sections/StorySection";
import useSmoothScroll from "../../hooks/useSmoothScroll";

function PageShell() {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Navbar />

      <main className="pt-16 sm:pt-16">
        <HeroSection />
        <ManifestSection />
        <StorySection />
        <FeaturesSection />
        <DifferentiatorSection />
        <FinalCTASection />
      </main>
    </div>
  );
}

export default PageShell;
