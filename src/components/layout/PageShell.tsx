import Navbar from "./Navbar";
import FeaturesSection from "../sections/FeaturesSection";
import FinalCtaSection from "../sections/final/FinalCtaSection";
import FooterSection from "../sections/footer/FooterSection";
import HeroSection from "../sections/HeroSection";
import ManifestSection from "../sections/ManifestSection";
import StorySection from "../sections/StorySection";
import useSmoothScroll from "../../hooks/useSmoothScroll";

function PageShell() {
  useSmoothScroll();

  return (
    <div className="min-h-screen overflow-x-clip bg-[#02040A] text-white">
      <Navbar />

      <main className="pt-16 sm:pt-16">
        <HeroSection />
        <ManifestSection />
        <StorySection />
        <FeaturesSection />
        <FinalCtaSection />
        <FooterSection />
      </main>
    </div>
  );
}

export default PageShell;
