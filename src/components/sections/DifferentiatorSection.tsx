import { useEffect, useRef } from "react";
import SectionContainer from "../layout/SectionContainer";
import { gsap } from "../../lib/gsap";

function DifferentiatorSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const labelRef = useRef<HTMLParagraphElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const label = labelRef.current;
    const headline = headlineRef.current;
    const paragraph = paragraphRef.current;

    if (!section || !label || !headline || !paragraph) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        label,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        },
      )
        .fromTo(
          headline,
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
          },
          0.14,
        )
        .fromTo(
          paragraph,
          {
            opacity: 0,
            y: 28,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          0.36,
        );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <SectionContainer
      ref={sectionRef}
      className="min-h-screen bg-[radial-gradient(circle_at_80%_30%,rgba(124,92,255,0.12),transparent_32%),linear-gradient(to_bottom,rgba(255,255,255,0.015),transparent)] flex items-center"
    >
      <div className="max-w-5xl">
        <p
          ref={labelRef}
          className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-white/50"
        >
          Differentiator
        </p>
        <h2
          ref={headlineRef}
          className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-7xl"
        >
          Not just a platform. A new paradigm.
        </h2>
        <p
          ref={paragraphRef}
          className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg"
        >
          This section creates space for the big promise of ORBIT, with visual
          weight and enough room for future storytelling effects.
        </p>
      </div>
    </SectionContainer>
  );
}

export default DifferentiatorSection;
