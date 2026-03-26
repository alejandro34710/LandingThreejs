import { useEffect, useMemo, useRef, useState } from "react";
import SectionContainer from "../../layout/SectionContainer";
import { gsap } from "../../../lib/gsap";
import FinalOrbitalObject from "./FinalOrbitalObject";
import usePerformanceMode from "../../../hooks/usePerformanceMode";

type Parallax = { x: number; y: number; rawX: number; rawY: number };

type Star = {
  id: number;
  top: string;
  left: string;
  delay: string;
  duration: string;
};

function FinalCtaSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  
  // Referencias para animaciones de entrada
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const ctasRef = useRef<HTMLDivElement | null>(null);

  // Estado para las estrellas fugaces
  const [shootingStars, setShootingStars] = useState<Star[]>([]);
  const { isLowPowerMode } = usePerformanceMode();

  // Tarjeta estática: sin parallax por movimiento del mouse
  const parallax = useMemo<Parallax>(() => ({ x: 0, y: 0, rawX: -1000, rawY: -1000 }), []);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  // Generación de estrellas y animaciones GSAP
  useEffect(() => {
    // 1. Generar estrellas aleatorias de forma segura para SSR/Hidratación
    const generateStars = Array.from({ length: isLowPowerMode ? 3 : 8 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${2 + Math.random() * 3}s`, // Duración entre 2 y 5 segundos
    }));
    const starTimer = window.setTimeout(() => {
      setShootingStars(generateStars);
    }, 0);

    // 2. Animaciones GSAP
    const section = sectionRef.current;
    if (!section) {
      window.clearTimeout(starTimer);
      return;
    }

    const loopingTweens: gsap.core.Tween[] = [];
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      tl.from([badgeRef.current, titleRef.current, subtitleRef.current, ctasRef.current], {
        opacity: 0,
        y: 20,
        filter: "blur(10px)",
        duration: 1,
        stagger: 0.15,
      })
      .from(panelRef.current, {
        opacity: 0,
        scale: 0.95,
        rotationX: 5,
        duration: 1.2,
      }, "-=0.8")
      .from(".hud-element", {
        opacity: 0,
        scale: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.5)"
      }, "-=1");

      if (!isLowPowerMode) {
        const tween = gsap.to(".ambient-glow", {
          scale: 1.1,
          opacity: 0.8,
          duration: 4,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          stagger: 2,
        });
        loopingTweens.push(tween);
      }
    }, section);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!isLowPowerMode) return;
        loopingTweens.forEach((tween) => {
          if (entry.isIntersecting) tween.resume();
          else tween.pause();
        });
      },
      { threshold: 0.05 },
    );
    io.observe(section);

    return () => {
      window.clearTimeout(starTimer);
      io.disconnect();
      ctx.revert();
    };
  }, [isLowPowerMode]);

  return (
    <SectionContainer
      ref={sectionRef}
      id="final-cta"
      className="relative overflow-hidden border-t border-cyan-900/30 bg-[#020308] py-24 lg:py-28"
    >
      {/* =========================================
          FONDOS, GRIDS Y ESTRELLAS FUGACES
          ========================================= */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        
        {/* Estrellas Fugaces Dinámicas */}
        {shootingStars.map((star) => (
          <div
            key={star.id}
            className="absolute h-px w-[150px] opacity-0"
            style={{
              top: star.top,
              left: star.left,
              background: "linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.8), transparent)",
              boxShadow: "0 0 10px rgba(34, 211, 238, 0.4)",
              animation: isLowPowerMode ? "none" : `meteor ${star.duration} linear ${star.delay} infinite`,
            }}
          />
        ))}

        <div className="ambient-glow absolute left-[-10%] top-[10%] h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="ambient-glow absolute right-[-5%] bottom-[-10%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div
          className="absolute inset-[-10%] opacity-30 transition-transform duration-700 ease-out"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(34, 211, 238, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(34, 211, 238, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)",
          }}
        />

        <div className="hud-element absolute left-12 top-24 text-cyan-500/40 font-mono text-xs tracking-widest">+</div>
        <div className="hud-element absolute right-12 bottom-24 text-cyan-500/40 font-mono text-xs tracking-widest">+</div>
        <div className="hud-element absolute left-[40%] top-12 text-cyan-500/30 font-mono text-[10px] tracking-widest rotate-90">SYS.ON</div>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-center gap-12 px-4 lg:grid-cols-12 lg:gap-10">
        
        {/* =========================================
            IZQUIERDA: CONTENIDO Y CTAs
            ========================================= */}
        <div className="lg:col-span-6 xl:col-span-5">
          <div ref={badgeRef} className="inline-flex w-max items-center gap-3 rounded-sm border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 backdrop-blur-md">
            <div className="h-2 w-2 bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-300">
              Protocol: Initialized
            </span>
          </div>

          <h2 ref={titleRef} className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            Take command.
            <br />
            <span className="bg-linear-to-r from-cyan-300 via-blue-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Launch your orbit.
            </span>
          </h2>

          <p ref={subtitleRef} className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            All systems verified. The final layer of interaction awaits your command. Secure, scalable, and built for the future.
          </p>

          <div ref={ctasRef} className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <a href="#features" className="group relative inline-flex h-12 items-center justify-center overflow-hidden border border-cyan-500/50 bg-cyan-500/10 px-8 text-xs font-mono uppercase tracking-[0.2em] text-cyan-50 backdrop-blur-md transition-all duration-300 hover:bg-cyan-500/20 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:-translate-y-0.5">
              <span className="absolute inset-0 w-0 bg-cyan-500/20 transition-all duration-300 ease-out group-hover:w-full" />
              <span className="relative z-10 flex items-center gap-3">
                Deploy System
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>
          </div>
        </div>

        {/* =========================================
            DERECHA: PANEL 3D INTERACTIVO
            ========================================= */}
        <div className="lg:col-span-6 xl:col-span-7 perspective-[1000px]">
          <div
            ref={panelRef}
            className="r3f-surface group relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden border border-white/5 bg-[#040610]/80 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:ml-auto lg:max-w-[620px]"
          >
            {/* Spotlight y Bordes */}
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: "radial-gradient(800px circle at 50% 50%, rgba(34,211,238,0.1), transparent 40%)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
                maskImage: "radial-gradient(300px circle at 50% 50%, black, transparent)",
              }}
            >
              <div className="absolute inset-0 border border-cyan-400/50" />
            </div>

            {/* Scanline y decoraciones */}
            <div className="absolute left-4 top-4 h-4 w-4 border-l-2 border-t-2 border-cyan-500/40" />
            <div className="absolute right-4 top-4 h-4 w-4 border-r-2 border-t-2 border-cyan-500/40" />
            <div className="absolute left-4 bottom-4 h-4 w-4 border-l-2 border-b-2 border-cyan-500/40" />
            <div className="absolute right-4 bottom-4 h-4 w-4 border-r-2 border-b-2 border-cyan-500/40" />
            <div
              className={`pointer-events-none absolute left-0 right-0 h-[2px] w-full bg-cyan-500/20 blur-[1px] ${
                isLowPowerMode ? "" : "animate-[scan_4s_ease-in-out_infinite]"
              }`}
            />

            <div className="relative z-10 flex h-full w-full flex-col justify-end p-6">
              
              <FinalOrbitalObject parallax={parallax} reducedMotion={reducedMotion} />
              
              <div className="relative z-20 flex items-center justify-between border-t border-cyan-500/20 bg-black/40 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <span className="block h-2 w-1 animate-pulse bg-cyan-500" />
                    <span className="block h-2 w-1 animate-pulse bg-cyan-500 animation-delay-150" />
                    <span className="block h-2 w-1 animate-pulse bg-cyan-500 animation-delay-300" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-200">
                    Live Feed
                  </span>
                </div>
                <span className="font-mono text-[10px] tracking-wider text-slate-400">
                  X: {Math.round(parallax.x * 100)} Y: {Math.round(parallax.y * 100)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tailwind Keyframes globales para la sección */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes meteor {
          0% {
            transform: rotate(215deg) translateX(200px);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: rotate(215deg) translateX(-1500px);
            opacity: 0;
          }
        }
      `}} />
    </SectionContainer>
  );
}

export default FinalCtaSection;