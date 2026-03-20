import { useEffect, useRef, useState } from "react";
import { gsap } from "../../lib/gsap";
import SectionContainer from "../layout/SectionContainer";
import { storyContent } from "./story/storyContent";
import StoryVisual from "./story/StoryVisual";

function StorySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const visualRef = useRef<HTMLDivElement | null>(null);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const visual = visualRef.current;

    if (!section || !visual) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power4.out" },
      });

      tl.fromTo(
        visual,
        { opacity: 0, y: 24, filter: "blur(20px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2 },
        0
      )
      .fromTo(
        ".stagger-item",
        { opacity: 0, y: 30, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, stagger: 0.15 },
        0.2
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <SectionContainer
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      // Mantenemos el fondo oscuro en la base
      className="relative min-h-screen overflow-hidden border-y border-white/5 bg-[#030014] flex items-center py-20 lg:py-0"
    >
      {/* ================= BACKGROUND: CAMBIADO A Z-0 PARA QUE SEA VISIBLE ================= */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        
        {/* 1. Luces Volumétricas (Aumenté la opacidad drásticamente para asegurar que las veas) */}
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-500/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-fuchsia-600/30 blur-[120px]" />
        <div className="absolute top-1/2 left-[28%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/40 blur-[100px]" />

        {/* 2. Órbitas Tecnológicas (Más brillantes) */}
        <div className="absolute top-1/2 left-[28%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-70">
          <div className="absolute h-[800px] w-[800px] animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-cyan-400/50" />
          <div className="absolute h-[600px] w-[600px] animate-[spin_30s_linear_infinite_reverse] rounded-full border border-dotted border-fuchsia-400/60" />
          <div className="absolute h-[400px] w-[400px] rounded-full border border-white/20" />
        </div>

        {/* 3. Grid con estilos en línea (100% a prueba de fallos) */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            maskImage: `radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)`
          }}
        />

        {/* 4. Partículas / Estrellas más brillantes */}
        <div className="absolute inset-0">
          <div className="absolute top-[5%] left-[60%] h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_15px_3px_rgba(34,211,238,1)]" />
          <div className="absolute top-[70%] left-[80%] h-2.5 w-2.5 rounded-full bg-fuchsia-400 shadow-[0_0_15px_3px_rgba(217,70,239,1)]" />
          <div className="absolute top-[40%] left-[10%] h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_15px_3px_rgba(129,140,248,1)] animate-pulse" />
        </div>

        {/* 5. Spotlight Dinámico del Ratón (Más intenso) */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: isHovering ? 1 : 0,
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 211, 238, 0.15), transparent 60%)`,
          }}
        />
      </div>
      {/* ================= FIN DEL BACKGROUND ================= */}

      {/* CONTENIDO: Z-10 para asegurar que esté por encima del fondo */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 px-6 lg:grid-cols-12 lg:gap-8">
        
        {/* Izquierda: Pieza escultórica (Modelo 3D) */}
        <div className="relative lg:col-span-7 flex justify-center lg:justify-start">
          <div
            ref={visualRef}
            className="relative w-full max-w-[600px] aspect-square lg:h-[700px] lg:w-auto drop-shadow-[0_0_40px_rgba(34,211,238,0.25)]"
          >
            <StoryVisual />
          </div>
        </div>

        {/* Derecha: Contenido editorial premium */}
        <div className="relative flex flex-col justify-center lg:col-span-5 lg:pr-8">
          
          <div className="stagger-item flex items-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-xl shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              {storyContent.badge}
            </span>
          </div>

          <h2 className="stagger-item mt-8 text-4xl font-light tracking-[-0.04em] text-transparent bg-clip-text bg-linear-to-br from-white via-white/95 to-white/50 sm:text-5xl lg:text-6xl leading-[1.1]">
            {storyContent.title}
          </h2>

          <p className="stagger-item mt-6 max-w-lg text-lg sm:text-xl font-light text-white/80 leading-relaxed">
            {storyContent.subtitle}
          </p>

          <p className="stagger-item mt-4 max-w-lg text-sm sm:text-base font-light leading-relaxed text-white/40">
            {storyContent.paragraph}
          </p>

          <div className="stagger-item mt-10">
            <a
              href={storyContent.cta.href}
              className="group relative inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-sm font-medium text-white backdrop-blur-md transition-all duration-500 hover:bg-white/20 hover:border-cyan-400/60 hover:shadow-[0_0_40px_rgba(34,211,238,0.3)] overflow-hidden"
            >
              <span className="relative z-10">{storyContent.cta.label}</span>
              <svg 
                className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </a>
          </div>

          <div className="stagger-item mt-12 flex items-center gap-3 text-xs tracking-wider text-white/40 uppercase">
            <div className="h-px w-12 bg-linear-to-r from-cyan-500/80 to-transparent" />
            <span>Interactive WebGL Experience</span>
          </div>

        </div>
      </div>
    </SectionContainer>
  );
}

export default StorySection;