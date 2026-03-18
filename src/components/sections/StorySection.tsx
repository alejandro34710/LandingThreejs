import { useRef } from "react";
import SectionContainer from "../layout/SectionContainer";
import useReveal from "../../hooks/useReveal";

function StorySection() {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useReveal(contentRef);

  return (
    <SectionContainer
      className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(77,166,255,0.08),transparent_35%),linear-gradient(to_bottom,rgba(255,255,255,0.015),transparent)] flex items-center"
    >
      <div ref={contentRef} className="max-w-4xl">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
          Story
        </p>
        <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
          Scroll-driven experience
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
          This section is prepared as the narrative bridge between the concept
          and the product feeling, with room for cinematic motion later.
        </p>
      </div>
    </SectionContainer>
  );
}

export default StorySection;
