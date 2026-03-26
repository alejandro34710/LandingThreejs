import SectionContainer from "../layout/SectionContainer";
import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import ManifestCard from "./manifest/ManifestCard";
import { manifestCards } from "./manifest/manifestData";
import ManifestAmbientScene from "./manifest/ManifestAmbientScene";
import useManifestMouseField from "./manifest/useManifestMouseField";
import usePerformanceMode from "../../hooks/usePerformanceMode";

function ManifestSection() {
  const { isLowPowerMode } = usePerformanceMode();
  const sectionRef = useRef<HTMLElement | null>(null);
  const badgeRef = useRef<HTMLParagraphElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cursorGlowRef = useRef<HTMLDivElement | null>(null);
  const scrollPulseRef = useRef<{ value: number }>({ value: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    const badge = badgeRef.current;
    const headline = headlineRef.current;
    const subtitle = subtitleRef.current;
    const content = contentRef.current;

    if (!section || !badge || !headline || !subtitle || !content) return;

    const cards = Array.from(
      content.querySelectorAll<HTMLElement>("[data-manifest-card]")
    );

    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(scrollPulseRef.current, { value: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          toggleActions: "play none none none",
          onEnter: () => {
            gsap.killTweensOf(scrollPulseRef.current);
            gsap.to(scrollPulseRef.current, {
              value: 1,
              duration: 0.6,
              ease: "expo.out",
              onComplete: () => {
                gsap.to(scrollPulseRef.current, {
                  value: 0.35,
                  duration: 0.85,
                  ease: "power2.out",
                });
              },
            });
          },
          onLeaveBack: () => {
            gsap.killTweensOf(scrollPulseRef.current);
            gsap.to(scrollPulseRef.current, {
              value: 0,
              duration: 0.35,
              ease: "power2.out",
            });
          },
          onLeave: () => {
            gsap.killTweensOf(scrollPulseRef.current);
            gsap.to(scrollPulseRef.current, {
              value: 0.08,
              duration: 0.4,
              ease: "power2.out",
            });
          },
        },
      });

      tl.fromTo(
        badge,
        { opacity: 0, y: 16, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }
      )
        .fromTo(
          headline,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
          },
          "-=0.25"
        )
        .fromTo(
          subtitle,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
          },
          "-=0.35"
        )
        .fromTo(
          cards,
          { opacity: 0, y: 28, scale: 0.99 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: "expo.out",
            stagger: 0.12,
          },
          "-=0.35"
        );
    }, section);

    return () => ctx.revert();
  }, []);

  const mouseFieldRef = useManifestMouseField({
    containerRef: sectionRef,
    glowRef: cursorGlowRef,
  });

  return (
    <SectionContainer
      ref={sectionRef}
      id="manifest"
      // Cambiamos a la base ultra oscura #030014
      className="relative min-h-screen overflow-hidden border-y border-white/5 bg-[#030014] flex items-center py-24"
    >
      {/* ================= BACKGROUND: Z-0 PARA VISIBILIDAD TOTAL ================= */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        
        {/* Tu escena ambiental existente (preservada) */}
        <ManifestAmbientScene mouseFieldRef={mouseFieldRef} scrollPulseRef={scrollPulseRef} />

        {/* 1. Luces Volumétricas (Paleta Índigo/Violeta/Azul para la sección Manifest) */}
        <div className="absolute top-[-15%] right-[-10%] h-[700px] w-[700px] rounded-full bg-indigo-600/25 blur-[130px]" />
        <div className="absolute bottom-[-15%] left-[-10%] h-[700px] w-[700px] rounded-full bg-violet-600/25 blur-[130px]" />
        <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/15 blur-[120px]" />

        {/* 2. Órbitas Tecnológicas animadas (Centradas arriba para enmarcar el título) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center opacity-60">
          <div
            className={`absolute h-[1200px] w-[1200px] rounded-full border border-dashed border-indigo-500/30 ${isLowPowerMode ? "" : "animate-[spin_50s_linear_infinite]"}`}
          />
          <div
            className={`absolute h-[900px] w-[900px] rounded-full border border-dotted border-violet-400/40 ${isLowPowerMode ? "" : "animate-[spin_35s_linear_infinite_reverse]"}`}
          />
          <div className="absolute h-[600px] w-[600px] rounded-full border border-white/10" />
        </div>

        {/* 3. Grid infalible con estilos inline */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
            maskImage: `radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)`
          }}
        />

        {/* 4. Partículas Flotantes (Data points) */}
        <div className="absolute inset-0">
          <div className="absolute top-[25%] left-[15%] h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_15px_3px_rgba(129,140,248,1)]" />
          <div className="absolute top-[60%] right-[15%] h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_15px_3px_rgba(167,139,250,1)] animate-pulse" />
          <div className="absolute bottom-[20%] left-[30%] h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_2px_rgba(96,165,250,1)]" />
        </div>

        {/* 5. Textura de ruido para el acabado fotográfico premium */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

        {/* 6. El Cursor Glow (Aumenté su tamaño y brillo para que se note el efecto de tu hook useManifestMouseField) */}
        <div
          ref={cursorGlowRef}
          className="pointer-events-none absolute left-0 top-0 h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,92,255,0.4),transparent_60%)] blur-[60px] opacity-0 sm:h-[650px] sm:w-[650px]"
        />
        
      </div>
      {/* ================= FIN DEL BACKGROUND ================= */}

      {/* CONTENIDO PRINCIPAL: Z-10 */}
      <div
        data-manifest-content
        ref={contentRef}
        className="relative z-10 mx-auto w-full max-w-7xl px-6"
      >
        <div className="flex flex-col items-center text-center">
          <p
            ref={badgeRef}
            className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-indigo-200 shadow-[0_0_30px_rgba(129,140,248,0.15)] backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Manifest
          </p>

          <h2
            ref={headlineRef}
            className="mt-8 text-4xl font-light tracking-[-0.04em] text-transparent bg-clip-text bg-linear-to-b from-white via-white/90 to-white/40 sm:text-5xl lg:text-6xl"
          >
            Getting started stays simple
          </h2>

          <p
            ref={subtitleRef}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl font-light"
          >
            A premium, dark-tech workflow designed to feel calm, clear, and
            responsive from the first moment.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {manifestCards.map((card) => (
            <ManifestCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

export default ManifestSection;