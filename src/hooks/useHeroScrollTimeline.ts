import { useEffect, useState, type MutableRefObject, type RefObject } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";

export type OrbitStoryValues = {
  // Pose control for OrbitScene rig
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  scaleMul: number;
  rotAddX: number;
  rotAddY: number;
  rotAddZ: number;
  motionMul: number;

  // Visual intensity control for materials / particles
  energy: number;
};

export type HeroScrollTimelineDomRefs = {
  eyebrowRef: RefObject<HTMLDivElement | null>;
  titleRef: RefObject<HTMLHeadingElement | null>;
  subtitleRef: RefObject<HTMLParagraphElement | null>;
  ctaRef: RefObject<HTMLDivElement | null>;

  // Orbital UI layer
  orbitalGlowRef: RefObject<HTMLDivElement | null>;
  chipLeftRef: RefObject<HTMLDivElement | null>;
  chipRightRef: RefObject<HTMLDivElement | null>;
  indicatorRef: RefObject<HTMLDivElement | null>;
  presetLabelRef: RefObject<HTMLDivElement | null>;

  // Contenedor DOM del canvas (para conectar con la siguiente sección).
  showcaseFrameRef: RefObject<HTMLDivElement | null>;

  // Hero background layer
  heroVignetteRef: RefObject<HTMLDivElement | null>;
  bgGlowLeftRef?: RefObject<HTMLDivElement | null>;
  bgGlowRightRef?: RefObject<HTMLDivElement | null>;
  bgGlowBottomRef?: RefObject<HTMLDivElement | null>;
};

type UseHeroScrollTimelineArgs = {
  sectionRef: RefObject<HTMLElement | null>;
  orbitStoryRef: MutableRefObject<OrbitStoryValues>;
  uiRefs: HeroScrollTimelineDomRefs;
  isMobile: boolean;
  isReducedMotion: boolean;
  isStoryActiveRef?: MutableRefObject<boolean>;
};

function getStoryInitialValues(): OrbitStoryValues {
  return {
    offsetX: 0,
    offsetY: 0,
    offsetZ: 0,
    scaleMul: 1,
    rotAddX: 0,
    rotAddY: 0,
    rotAddZ: 0,
    motionMul: 0.85,
    energy: 0.12,
  };
}

function useHeroScrollTimeline({
  sectionRef,
  orbitStoryRef,
  uiRefs,
  isMobile,
  isReducedMotion,
  isStoryActiveRef,
}: UseHeroScrollTimelineArgs) {
  const [isStoryActive, setIsStoryActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (isReducedMotion) {
      const initial = getStoryInitialValues();
      gsap.set(orbitStoryRef.current, initial);
      if (isStoryActiveRef) isStoryActiveRef.current = false;
      return;
    }

    const {
      eyebrowRef,
      titleRef,
      subtitleRef,
      ctaRef,
      orbitalGlowRef,
      chipLeftRef,
      chipRightRef,
      indicatorRef,
      presetLabelRef,
      showcaseFrameRef,
      heroVignetteRef,
      bgGlowLeftRef,
      bgGlowRightRef,
      bgGlowBottomRef,
    } = uiRefs;

    const eyebrow = eyebrowRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const cta = ctaRef.current;
    const orbitalGlow = orbitalGlowRef.current;
    const chipLeft = chipLeftRef.current;
    const chipRight = chipRightRef.current;
    const indicator = indicatorRef.current;
    const presetLabel = presetLabelRef.current;
    const showcaseFrame = showcaseFrameRef.current;
    const heroVignette = heroVignetteRef.current;

    const bgLeft = bgGlowLeftRef?.current;
    const bgRight = bgGlowRightRef?.current;
    const bgBottom = bgGlowBottomRef?.current;

    // Elemento de la segunda sección (Manifest) para “handoff” visual.
    // Se define con data-attribute para evitar depender de clases frágiles.
    const manifestContent = document.querySelector(
      "[data-manifest-content]",
    ) as HTMLElement | null;

    if (
      !eyebrow ||
      !title ||
      !subtitle ||
      !cta ||
      !orbitalGlow ||
      !chipLeft ||
      !chipRight ||
      !indicator ||
      !presetLabel ||
      !showcaseFrame ||
      !heroVignette
    ) {
      return;
    }

    const initial = getStoryInitialValues();
    gsap.set(orbitStoryRef.current, initial);

    gsap.set([eyebrow, title, subtitle, cta], { clearProps: "transform", opacity: 1 });

    // Estado inicial del contenedor del canvas (visual handoff).
    gsap.set(showcaseFrame, { x: 0, y: 0, scale: 1, transformOrigin: "center center" });
    if (manifestContent) gsap.set(manifestContent, { x: 0 });

    gsap.set(orbitalGlow, { opacity: isMobile ? 0.22 : 0.32, scale: 1 });
    gsap.set(chipLeft, { opacity: 0.92, y: 0, x: 0, scale: 1 });
    gsap.set(chipRight, { opacity: 0.92, y: 0, x: 0, scale: 1 });
    gsap.set(indicator, { opacity: 0.95, y: 0 });
    gsap.set(presetLabel, { opacity: 1, y: 0 });

    gsap.set(heroVignette, { opacity: 0.9 });
    if (bgLeft) gsap.set(bgLeft, { opacity: 1 });
    if (bgRight) gsap.set(bgRight, { opacity: 1 });
    if (bgBottom) gsap.set(bgBottom, { opacity: 1 });

    const ctx = gsap.context(() => {
      let lastActive = false;
      // Targets calculados en px para que el "handoff" termine EXACTO.
      let handoffTargets = {
        sphereDx: 0,
        sphereDy: 0,
        manifestDx: 0,
        sphereScale: 1,
      };

      const recalcHandoffTargets = () => {
        // Objetivo: esfera estática durante el scroll.
        // Mantenemos el “handoff” en cero para que `showcaseFrame` (canvas) no se desplace.
        handoffTargets = { sphereDx: 0, sphereDy: 0, manifestDx: 0, sphereScale: 1 };
      };

      recalcHandoffTargets();

      let tl: gsap.core.Timeline | null = null;
      tl = gsap.timeline({
        defaults: {
          ease: "power2.out",
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          // Más “cinematográfico”: suaviza el seguimiento del scroll.
          scrub: isMobile ? 1.05 : 1.15,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const next = self.progress > 0.01 && self.progress < 0.99;
            if (next === lastActive) return;
            lastActive = next;
            if (isStoryActiveRef) isStoryActiveRef.current = next;
            setIsStoryActive(next);
          },
          onRefresh: () => {
            recalcHandoffTargets();
            tl?.invalidate();
          },
        },
      });

      // Exit handoff (scrub sin pin): 0 - ~60% mantiene protagonismo,
      // ~60% - 100% integra el Hero con la siguiente sección.

      // Segmento A (≈0 - 25%)
      tl.to(
        orbitStoryRef.current,
        {
          energy: 0.12,
          offsetX: 0,
          offsetY: 0,
          offsetZ: 0,
          scaleMul: 1.0,
          rotAddX: 0,
          rotAddY: 0,
          rotAddZ: 0,
          motionMul: 0.85,
          duration: 0.25,
        },
        0
      )
        .to(
          eyebrow,
          {
            opacity: 0.86,
            x: -3,
            duration: 0.25,
          },
          0
        )
        .to(
          title,
          {
            opacity: 0.96,
            y: 7,
            scale: 0.99,
            duration: 0.25,
          },
          0
        )
        .to(
          subtitle,
          {
            opacity: 0.88,
            y: 6,
            duration: 0.25,
          },
          0
        )
        .to(
          cta,
          {
            opacity: 0.78,
            y: 8,
            duration: 0.25,
          },
          0
        )
        .to(
          orbitalGlow,
          {
            opacity: isMobile ? 0.22 : 0.3,
            scale: 1.0,
            duration: 0.25,
          },
          0
        )
        .to(
          [chipLeft, chipRight],
          {
            opacity: 0.82,
            y: (i: number) => (i === 0 ? 5 : -5),
            duration: 0.25,
          },
          0
        )
        .to(
          indicator,
          {
            opacity: 0.86,
            y: 4,
            duration: 0.25,
          },
          0
        );

      // ACTO 2 — TECH REVEAL (25 - 80%)
      tl.to(
        orbitStoryRef.current,
        {
          energy: 0.12,
          offsetX: 0,
          offsetY: 0,
          offsetZ: 0,
          scaleMul: 1.0,
          rotAddX: 0,
          rotAddY: 0,
          rotAddZ: 0,
          motionMul: 0.85,
          duration: 0.3,
        },
        0.25
      )
        .to(
          title,
          {
            opacity: 0.75,
            y: 12,
            scale: 0.985,
            duration: 0.3,
          },
          0.25
        )
        .to(
          subtitle,
          {
            opacity: 0.72,
            y: 10,
            duration: 0.3,
          },
          0.25
        )
        .to(
          orbitalGlow,
          {
            opacity: isMobile ? 0.26 : 0.32,
            scale: 1.01,
            duration: 0.3,
          },
          0.25
        )
        .to(
          presetLabel,
          {
            opacity: 0.75,
            y: -3,
            duration: 0.3,
          },
          0.25
        )
        .to(
          cta,
          {
            opacity: 0,
            y: -3,
            duration: 0.25,
          },
          0.65
        );

      // Second part of ACTO 2 — reveal highlights (55 - 80%)
      tl.to(
        orbitStoryRef.current,
        {
          energy: 0.12,
          offsetX: 0,
          offsetY: 0,
          offsetZ: 0,
          scaleMul: 1.0,
          rotAddX: 0,
          rotAddY: 0,
          rotAddZ: 0,
          motionMul: 0.85,
          duration: 0.25,
        },
        0.55
      )
        // Handoff visual exacto: la esfera se coloca a la izquierda del Manifest.
        .to(
          showcaseFrame,
          {
            x: () => handoffTargets.sphereDx,
            y: () => handoffTargets.sphereDy,
            scale: () => handoffTargets.sphereScale,
            duration: 0.45,
          },
          0.55
        )
        .to(
          manifestContent,
          {
            x: () => handoffTargets.manifestDx,
            duration: 0.45,
          },
          0.55
        )
        .to(
          [chipLeft, chipRight],
          {
            opacity: 0.68,
            scale: 1.0,
            duration: 0.2,
          },
          0.55
        )
        .to(
          indicator,
          {
            opacity: 0.75,
            y: 4,
            duration: 0.25,
          },
          0.55
        );

      // ACTO 3 — TRANSITION OUT (80 - 100%)
      tl.to(
        orbitStoryRef.current,
        {
          energy: 0.12,
          offsetX: 0,
          offsetY: 0,
          offsetZ: 0,
          scaleMul: 1.0,
          rotAddX: 0,
          rotAddY: 0,
          rotAddZ: 0,
          motionMul: 0.85,
          duration: 0.2,
        },
        0.8
      )
        .to(
          eyebrow,
          {
            opacity: 0,
            y: -10,
            duration: 0.2,
          },
          0.8
        )
        .to(
          title,
          {
            opacity: 0,
            y: 18,
            scale: 0.92,
            duration: 0.2,
          },
          0.8
        )
        .to(
          subtitle,
          {
            opacity: 0,
            y: 14,
            duration: 0.2,
          },
          0.8
        )
        .to(
          orbitalGlow,
          {
            opacity: isMobile ? 0.14 : 0.2,
            scale: 0.99,
            duration: 0.2,
          },
          0.8
        )
        .to(
          [chipLeft, chipRight],
          {
            opacity: 0,
            y: (i: number) => (i === 0 ? 12 : -12),
            duration: 0.2,
          },
          0.8
        )
        .to(
          indicator,
          {
            opacity: 0,
            y: 12,
            duration: 0.2,
          },
          0.8
        )
        .to(
          presetLabel,
          {
            opacity: 0,
            y: 12,
            duration: 0.2,
          },
          0.8
        )
        .to(
          heroVignette,
          {
            opacity: 0.35,
            duration: 0.2,
          },
          0.8
        );

      if (bgLeft) {
        tl.to(bgLeft, { opacity: 0.1, duration: 0.2 }, 0.8);
      }
      if (bgRight) {
        tl.to(bgRight, { opacity: 0.08, duration: 0.2 }, 0.8);
      }
      if (bgBottom) {
        tl.to(bgBottom, { opacity: 0.1, duration: 0.2 }, 0.8);
      }

      // Initial state must match on refresh / resize.
      ScrollTrigger.refresh();
    });

    const onResize = () => {
      window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 80);
    };
    window.addEventListener("resize", onResize);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", onResize);
      setIsStoryActive(false);
      if (isStoryActiveRef) isStoryActiveRef.current = false;
    };
  }, [sectionRef, orbitStoryRef, uiRefs, isMobile, isReducedMotion, isStoryActiveRef]);

  return { isStoryActive };
}

export default useHeroScrollTimeline;

