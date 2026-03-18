import { useEffect, useRef } from "react";
import SectionContainer from "../layout/SectionContainer";
import { gsap } from "../../lib/gsap";

const featureCards = [
  {
    title: "Motion-first layout",
    description: "Prepared for immersive transitions and scroll moments.",
  },
  {
    title: "3D-ready canvas",
    description: "Space reserved for future Three.js and Fiber scenes.",
  },
  {
    title: "Premium spacing",
    description: "Large rhythm and breathing room for a luxury feel.",
  },
  {
    title: "Composable sections",
    description: "Each block stays isolated, reusable and easy to evolve.",
  },
];

function FeaturesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const labelRef = useRef<HTMLParagraphElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const label = labelRef.current;
    const headline = headlineRef.current;
    const grid = gridRef.current;
    const cards = cardRefs.current.filter(
      (card): card is HTMLElement => card !== null,
    );

    if (!section || !label || !headline || !grid || cards.length === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        [label, headline],
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
        },
      ).fromTo(
        cards,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
        },
        0.2,
      );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <SectionContainer
      ref={sectionRef}
      className="bg-slate-950/40 border-y border-white/5"
    >
      <div>
        <p
          ref={labelRef}
          className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-white/50"
        >
          Features
        </p>
        <h2
          ref={headlineRef}
          className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl"
        >
          Built to become a rich scroll experience
        </h2>

        <div ref={gridRef} className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((card, index) => (
            <article
              key={card.title}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm transition duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
            >
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

export default FeaturesSection;
