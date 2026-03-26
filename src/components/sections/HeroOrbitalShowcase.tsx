import { useEffect, useMemo, useRef, type MutableRefObject, type PointerEvent, type RefObject } from "react";
import { gsap } from "../../lib/gsap";
import OrbitScene from "../three/OrbitScene";
import type { OrbitVariant } from "../three/orbitVariants";
import type { OrbitStoryValues } from "../../hooks/useHeroScrollTimeline";

type RotationOffset = { x: number; y: number };

type HeroOrbitalShowcaseProps = {
  activeIndex: number;
  fromPreset: OrbitVariant;
  toPreset: OrbitVariant;
  mixRef: MutableRefObject<{ value: number }>;

  rotationOffsetRef: MutableRefObject<RotationOffset>;
  velocityRef: MutableRefObject<RotationOffset>;
  isDraggingRef: MutableRefObject<boolean>;
  parallaxRef: MutableRefObject<{ x: number; y: number }>;
  orbitStoryRef: MutableRefObject<OrbitStoryValues>;
  isInteractionLocked: boolean;

  goPrev: () => void;
  goNext: () => void;

  bindShowcaseDrag: {
    onPointerDown: (e: PointerEvent<HTMLElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLElement>) => void;
    onPointerUp: (e: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
    onPointerLeave: () => void;
  };

  isMobile: boolean;

  orbitalGlowRef: RefObject<HTMLDivElement | null>;
  chipLeftRef: RefObject<HTMLDivElement | null>;
  chipRightRef: RefObject<HTMLDivElement | null>;
  indicatorRef: RefObject<HTMLDivElement | null>;
  presetLabelRef: RefObject<HTMLDivElement | null>;

  // Contenedor DOM del canvas (para la transición Hero -> siguiente sección).
  showcaseFrameRef: RefObject<HTMLDivElement | null>;
};

function HeroOrbitalShowcase({
  activeIndex,
  fromPreset,
  toPreset,
  mixRef,
  rotationOffsetRef,
  velocityRef,
  isDraggingRef,
  parallaxRef,
  orbitStoryRef,
  isInteractionLocked,
  goPrev,
  goNext,
  bindShowcaseDrag,
  isMobile,
  orbitalGlowRef,
  chipLeftRef,
  chipRightRef,
  indicatorRef,
  presetLabelRef,
  showcaseFrameRef,
}: HeroOrbitalShowcaseProps) {
  const activeNumberLabel = useMemo(() => String(activeIndex + 1).padStart(2, "0"), [activeIndex]);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isInteractionLocked) return;
    if (!orbitalGlowRef.current) return;

    gsap.to(orbitalGlowRef.current, {
      backgroundColor: toPreset.theme.glowColor,
      opacity: isMobile ? 0.25 : 0.4, // Aumenté un poco la opacidad base para el modo oscuro
      duration: isMobile ? 0.55 : 0.78,
      ease: "expo.out",
      overwrite: "auto",
    });
  }, [fromPreset.id, toPreset.id, toPreset.theme.glowColor, isMobile, isInteractionLocked, orbitalGlowRef]);

  useEffect(() => {
    if (!chipLeftRef.current || !chipRightRef.current) return;

    const chipLeft = chipLeftRef.current;
    const chipRight = chipRightRef.current;

    if (isInteractionLocked) {
      // Evita que la animación de entrada inicial pelee con el scrub.
      gsap.killTweensOf([chipLeft, chipRight]);
      gsap.set([chipLeft, chipRight], { opacity: 0.92, y: 0, x: 0, scale: 1 });
      return;
    }

    // Entrada inicial
    gsap.fromTo(
      [chipLeft, chipRight],
      { opacity: 0, scale: 0.82 },
      { opacity: 1, scale: 1, duration: 1.2, stagger: 0.18, ease: "back.out(1.4)" }
    );
  }, [chipLeftRef, chipRightRef, isInteractionLocked]);

  // Movimiento flotante SOLO cuando no está bloqueado por la narrativa.
  // Mientras el hero está pineado, GSAP/ScrollTrigger controla estos valores (sin pelear).
  useEffect(() => {
    if (isInteractionLocked) return;
    const chipLeft = chipLeftRef.current;
    const chipRight = chipRightRef.current;
    if (!chipLeft || !chipRight) return;

    if (isInteractionLocked) {
      gsap.killTweensOf([chipLeft, chipRight]);
      return;
    }

    const leftTween = gsap.to(chipLeft, {
      y: -10,
      duration: 3.0,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      overwrite: "auto",
    });

    const rightTween = gsap.to(chipRight, {
      y: 12,
      duration: 3.4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: 0.25,
      overwrite: "auto",
    });

    return () => {
      leftTween.kill();
      rightTween.kill();
    };
  }, [chipLeftRef, chipRightRef, isInteractionLocked]);

  useEffect(() => {
    const chipLeft = chipLeftRef.current;
    const chipRight = chipRightRef.current;
    if (!chipLeft || !chipRight) return;
    if (isInteractionLocked) return;

    // Reacción sutil según el modo
    const isClean = toPreset.visualPreset === "clean";
    const isEnergetic = toPreset.visualPreset === "energetic";
    const isAdvanced = toPreset.visualPreset === "advanced";

    gsap.to(chipLeft, {
      scale: isClean ? 1.08 : isAdvanced ? 1.04 : 1.0,
      filter: isClean ? "drop-shadow(0 0 20px rgba(168,85,247,0.4))" : "drop-shadow(0 0 0 rgba(0,0,0,0))",
      duration: 0.55,
      ease: "expo.out",
    });
    gsap.to(chipRight, {
      scale: isEnergetic ? 1.08 : isAdvanced ? 1.045 : 1.0,
      filter: isEnergetic ? "drop-shadow(0 0 20px rgba(34,211,238,0.4))" : "drop-shadow(0 0 0 rgba(0,0,0,0))",
      duration: 0.55,
      ease: "expo.out",
    });
  }, [toPreset.id, toPreset.visualPreset, isInteractionLocked, chipLeftRef, chipRightRef]);

  return (
    <div className="relative flex min-h-[360px] w-full items-center justify-center sm:min-h-[380px] md:min-h-[720px] xl:min-h-[860px]">
      
      {/* Luz de fondo mejorada con mix-blend-screen */}
      <div
        ref={orbitalGlowRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen blur-[105px] sm:h-[330px] sm:w-[330px] sm:blur-[100px] md:h-[500px] md:w-[500px] md:blur-[120px]"
        style={{ backgroundColor: fromPreset.theme.glowColor, opacity: isMobile ? 0.2 : 0.3 }}
      />

      {/* Chips flotantes (Estilo Glassmorphism Oscuro) */}
      <div
        ref={chipRightRef}
        className="absolute right-[5%] top-[15%] z-20 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#02040A]/40 px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:flex"
      >
        <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Visual Core</span>
      </div>

      <div
        ref={chipLeftRef}
        className="absolute bottom-[20%] left-[0%] z-20 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#02040A]/40 px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:flex"
      >
        <div className="h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.8)] animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Premium Motion</span>
      </div>

      {/* Canvas 3D + Interacción */}
      <div
          className={`relative z-10 flex items-center justify-center ${isInteractionLocked || isMobile ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
        {...(!isInteractionLocked && !isMobile ? bindShowcaseDrag : {})}
        onPointerDown={(e) => {
          if (!isMobile || isInteractionLocked) return;
          swipeStartRef.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          if (!isMobile || isInteractionLocked) return;
          const start = swipeStartRef.current;
          swipeStartRef.current = null;
          if (!start) return;

          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (absDx < 28 || absDx <= absDy) return;
          if (dx < 0) goNext();
          else goPrev();
        }}
        onPointerCancel={() => {
          swipeStartRef.current = null;
        }}
        style={{ touchAction: "pan-y", pointerEvents: isInteractionLocked ? "none" : "auto" }}
      >
        <div
          ref={showcaseFrameRef}
          className="pointer-events-none relative h-[430px] w-[430px] sm:h-[320px] sm:w-[320px] md:h-[680px] md:w-[680px] xl:h-[800px] xl:w-[800px]"
        >
          <OrbitScene
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            isMobile={isMobile}
            mixRef={mixRef}
            fromPreset={fromPreset}
            toPreset={toPreset}
            rotationOffsetRef={rotationOffsetRef}
            velocityRef={velocityRef}
            isDraggingRef={isDraggingRef}
            parallaxRef={parallaxRef}
            orbitStoryRef={orbitStoryRef}
          />
        </div>

        {/* UI: Controles e Indicadores FUI (Futuristic UI) */}
        <div className="absolute inset-0 pointer-events-none">
          
          {/* Indicador Numérico y Dots */}
          <div
            ref={indicatorRef}
            className="pointer-events-none absolute left-1/2 top-[8%] hidden -translate-x-1/2 flex-col items-center gap-3 md:pointer-events-auto md:top-[18%] md:flex md:flex-row md:gap-4"
          >
            <div className="flex items-center justify-center rounded-full border border-white/10 bg-[#02040A]/40 px-5 py-2 shadow-lg backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">
                {activeNumberLabel} <span className="text-white/30">/ 03</span>
              </span>
            </div>
            
            <div className="flex items-center gap-3 rounded-full border border-white/5 bg-[#02040A]/20 px-4 py-2 backdrop-blur-sm">
              {[0, 1, 2].map((i) => {
                const isActive = i === activeIndex;
                return (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isActive 
                        ? "w-4 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" 
                        : "w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Flecha Izquierda */}
          <button
            type="button"
            aria-label="Previous variant"
            disabled={isInteractionLocked}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goPrev();
            }}
            className={`pointer-events-auto absolute left-[1%] top-1/2 hidden group h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#02040A]/50 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-cyan-400/50 hover:bg-cyan-900/20 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] sm:h-11 sm:w-11 md:left-[8%] md:flex md:h-14 md:w-14 ${isInteractionLocked ? "opacity-40" : ""}`}
          >
            <svg
              className="h-4 w-4 text-gray-400 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] sm:h-5 sm:w-5 md:h-6 md:w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Flecha Derecha */}
          <button
            type="button"
            aria-label="Next variant"
            disabled={isInteractionLocked}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goNext();
            }}
            className={`pointer-events-auto absolute right-[1%] top-1/2 hidden group h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#02040A]/50 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-purple-500/50 hover:bg-purple-900/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] sm:h-11 sm:w-11 md:right-[8%] md:flex md:h-14 md:w-14 ${isInteractionLocked ? "opacity-40" : ""}`}
          >
            <svg
              className="h-4 w-4 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] sm:h-5 sm:w-5 md:h-6 md:w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Etiqueta Inferior Descriptiva (Nombre del Preset) */}
          <div
            ref={presetLabelRef}
            className="pointer-events-none absolute bottom-[8%] left-1/2 hidden -translate-x-1/2 sm:bottom-[10%] md:pointer-events-auto md:bottom-[18%] md:block"
          >
            <div className="overflow-hidden rounded-full border border-white/10 bg-[#02040A]/60 px-4 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 hover:border-white/20 sm:px-6 sm:py-2.5">
              <span className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em] transition-colors duration-500 sm:text-xs sm:tracking-[0.2em] ${
                toPreset.visualPreset === "clean"
                  ? "text-transparent bg-clip-text bg-linear-to-r from-gray-200 to-white"
                  : toPreset.visualPreset === "energetic"
                  ? "text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500"
                  : "text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-500"
              }`}>
                {toPreset.visualPreset === "clean"
                  ? "Clean Premium"
                  : toPreset.visualPreset === "energetic"
                  ? "Kinetic Energy"
                  : "Cinematic Glow"}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default HeroOrbitalShowcase;