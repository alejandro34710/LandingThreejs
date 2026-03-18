import { useRef } from "react";
import SectionContainer from "../layout/SectionContainer";
import useReveal from "../../hooks/useReveal";

function ManifestSection() {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useReveal(contentRef);

  return (
    <SectionContainer
      className="min-h-screen bg-slate-950/35 flex items-center border-y border-white/5"
    >
      <div ref={contentRef} className="max-w-4xl">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
          Manifest
        </p>
        <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
          We design beyond interfaces
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
          ORBIT is being shaped as a premium digital journey where motion,
          depth and clarity work together from the first scroll.
        </p>
      </div>
    </SectionContainer>
  );
}

export default ManifestSection;
