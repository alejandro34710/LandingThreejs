import { useEffect, useRef } from "react";
import SectionContainer from "../layout/SectionContainer";
import { gsap } from "../../lib/gsap";

function FinalCTASection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const labelRef = useRef<HTMLParagraphElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const label = labelRef.current;
    const headline = headlineRef.current;
    const button = buttonRef.current;

    if (!section || !label || !headline || !button) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        label,
        {
          opacity: 0,
          y: 24,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        },
      )
        .fromTo(
          headline,
          {
            opacity: 0,
            y: 34,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
          },
          0.16,
        )
        .fromTo(
          button,
          {
            opacity: 0,
            y: 20,
            scale: 0.96,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
          },
          0.34,
        );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <SectionContainer
      ref={sectionRef}
      id="final-cta"
      className="bg-slate-950/45 flex items-center border-t border-white/5"
    >
      <div className="max-w-4xl">
        <p
          ref={labelRef}
          className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-white/50"
        >
          Final CTA
        </p>
        <h2
          ref={headlineRef}
          className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl"
        >
          Start your journey with ORBIT
        </h2>
        <div className="mt-10">
          <button
            ref={buttonRef}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_12px_30px_rgba(255,255,255,0.12)]"
          >
            Get Started
          </button>
        </div>
      </div>
    </SectionContainer>
  );
}

export default FinalCTASection;
