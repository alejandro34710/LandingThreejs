import { useEffect, useRef } from "react";
import SectionContainer from "../layout/SectionContainer";
import { gsap } from "../../lib/gsap";
import OrbitScene from "../three/OrbitScene";

function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const cta = ctaRef.current;

    if (!section || !title || !subtitle || !cta) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        title,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
      )
        .fromTo(
          subtitle,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          0.2,
        )
        .fromTo(
          cta,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          0.4,
        );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <SectionContainer
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen overflow-hidden !py-16 sm:!py-20 lg:!py-20 bg-[radial-gradient(circle_at_top,rgba(124,92,255,0.14),transparent_35%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)] flex items-center"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[18%] h-[18rem] w-[18rem] rounded-full bg-violet-500/10 blur-3xl lg:h-[24rem] lg:w-[24rem]" />
        <div className="absolute right-[4%] top-[12%] h-[26rem] w-[26rem] rounded-full bg-violet-500/10 blur-3xl lg:h-[34rem] lg:w-[34rem]" />
        <div className="absolute bottom-[-8rem] right-[10%] h-[20rem] w-[20rem] rounded-full bg-blue-500/10 blur-3xl lg:h-[26rem] lg:w-[26rem]" />
      </div>

      <div className="relative z-10 grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-16">
        <div className="max-w-2xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
            Landing / Hero
          </p>
          <h1
            ref={titleRef}
            className="text-6xl font-semibold tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl"
          >
            ORBIT
          </h1>
          <p
            ref={subtitleRef}
            className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg"
          >
            A new dimension of digital experience
          </p>
          <div ref={ctaRef} className="mt-10">
            <button className="rounded-full border border-white/10 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/15">
              Explore ORBIT
            </button>
          </div>
        </div>

        <div className="relative isolate h-[320px] w-full max-w-[600px] justify-self-end translate-y-2 sm:h-[400px] lg:h-[520px] lg:max-w-[640px]">
          <div className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle_at_center,rgba(124,92,255,0.12),transparent_50%),radial-gradient(circle_at_72%_46%,rgba(77,166,255,0.08),transparent_58%)] blur-3xl" />
          <div className="absolute inset-0 rounded-[3rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.004))] opacity-70" />
          <div className="relative h-full w-full">
            <OrbitScene className="h-full w-full pointer-events-none" />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

export default HeroSection;
