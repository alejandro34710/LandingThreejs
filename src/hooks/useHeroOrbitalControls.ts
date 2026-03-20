import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject, type PointerEvent } from "react";
import { gsap } from "../lib/gsap";
import { ORBIT_VARIANTS, getVariantByIndex, type OrbitVariant, wrapIndex } from "../components/three/orbitVariants";

type RotationOffset = { x: number; y: number };

type UseHeroOrbitalControlsReturn = {
  variants: OrbitVariant[];
  activeIndex: number;
  fromIndex: number;
  toIndex: number;
  activePreset: OrbitVariant;
  fromPreset: OrbitVariant;
  toPreset: OrbitVariant;
  mixRef: MutableRefObject<{ value: number }>;

  rotationOffsetRef: MutableRefObject<RotationOffset>;
  velocityRef: MutableRefObject<RotationOffset>;
  isDraggingRef: MutableRefObject<boolean>;
  parallaxRef: MutableRefObject<{ x: number; y: number }>;

  goPrev: () => void;
  goNext: () => void;
  setVariantIndex: (index: number) => void;

  bindHeroParallax: {
    onPointerMove: (e: PointerEvent<HTMLElement>) => void;
    onPointerLeave: () => void;
  };
  bindShowcaseDrag: {
    onPointerDown: (e: PointerEvent<HTMLElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLElement>) => void;
    onPointerUp: (e: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
    onPointerLeave: () => void;
  };

  isMobile: boolean;
  isReducedMotion: boolean;
};

type UseHeroOrbitalControlsArgs = {
  isStoryActiveRef?: MutableRefObject<boolean>;
};

function useHeroOrbitalControls({ isStoryActiveRef }: UseHeroOrbitalControlsArgs = {}): UseHeroOrbitalControlsReturn {
  const variants = useMemo(() => ORBIT_VARIANTS, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [fromIndex, setFromIndex] = useState(0);
  const [toIndex, setToIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);

  const mixRef = useRef<{ value: number }>({ value: 1 });

  const rotationOffsetRef = useRef<RotationOffset>({ x: 0, y: 0 });
  const velocityRef = useRef<RotationOffset>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // Target parallax (OrbitScene lo suaviza con lerp)
  const parallaxRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const pointerIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragAccRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isMobile, setIsMobile] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const isTransitioningRef = useRef(false);
  const lastUserInteractionAtRef = useRef<number>(0);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const m1 = window.matchMedia("(max-width: 768px)");
    const m2 = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setIsMobile(m1.matches);
      setIsReducedMotion(m2.matches);
    };

    update();

    const onChange1 = () => update();
    const onChange2 = () => update();

    if (typeof m1.addEventListener === "function") {
      m1.addEventListener("change", onChange1);
      m2.addEventListener("change", onChange2);
      return () => {
        m1.removeEventListener("change", onChange1);
        m2.removeEventListener("change", onChange2);
      };
    }

    // Fallback legacy
    m1.addListener(onChange1);
    m2.addListener(onChange2);
    return () => {
      m1.removeListener(onChange1);
      m2.removeListener(onChange2);
    };
  }, []);

  const activePreset = useMemo(() => getVariantByIndex(activeIndex), [activeIndex, variants]);
  const fromPreset = useMemo(() => getVariantByIndex(fromIndex), [fromIndex, variants]);
  const toPreset = useMemo(() => getVariantByIndex(toIndex), [toIndex, variants]);

  const transitionTo = useCallback(
    (nextIndexRaw: number) => {
      const nextIndex = wrapIndex(nextIndexRaw);
      const prevIndex = activeIndexRef.current;
      if (nextIndex === prevIndex) return;
      if (isTransitioningRef.current) return;

      isTransitioningRef.current = true;
      lastUserInteractionAtRef.current = Date.now();

      setFromIndex(prevIndex);
      setToIndex(nextIndex);
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);

      mixRef.current.value = 0;

      gsap.to(mixRef.current, {
        value: 1,
        duration: isMobile ? 0.62 : 0.78,
        ease: "expo.out",
        overwrite: "auto",
        onComplete: () => {
          setFromIndex(nextIndex);
          setToIndex(nextIndex);
          mixRef.current.value = 1;
          isTransitioningRef.current = false;
        },
      });
    },
    [isMobile, isStoryActiveRef]
  );

  const goPrev = useCallback(() => {
    transitionTo(activeIndexRef.current - 1);
  }, [transitionTo]);

  const goNext = useCallback(() => {
    transitionTo(activeIndexRef.current + 1);
  }, [transitionTo]);

  const setVariantIndex = useCallback(
    (index: number) => {
      transitionTo(index);
    },
    [transitionTo]
  );

  useEffect(() => {
    if (!isMobile || isReducedMotion) return;

    const interval = window.setInterval(() => {
      if (isStoryActiveRef?.current) return;
      const now = Date.now();
      const recentlyInteracted = now - lastUserInteractionAtRef.current < 8500;
      if (recentlyInteracted) return;
      if (isTransitioningRef.current) return;
      transitionTo(activeIndexRef.current + 1);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [isMobile, isReducedMotion, transitionTo, variants.length, isStoryActiveRef]);

  const bindHeroParallax = useMemo(() => {
    const onPointerMove = (e: PointerEvent<HTMLElement>) => {
      if (isReducedMotion) return;
      // Durante drag no movemos el parallax del texto.
      if (isDraggingRef.current) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const clamp = (v: number, a: number) => Math.max(-a, Math.min(a, v));

      // Normalizado ~ [-0.5, 0.5]
      parallaxRef.current.x = clamp(dx, 0.45);
      parallaxRef.current.y = clamp(dy, 0.35);
    };

    const onPointerLeave = () => {
      parallaxRef.current.x = 0;
      parallaxRef.current.y = 0;
    };

    return { onPointerMove, onPointerLeave };
  }, [isReducedMotion, isStoryActiveRef]);

  const bindShowcaseDrag = useMemo(() => {
    const sensitivityYaw = 0.006;
    const sensitivityPitch = 0.0048;

    const onPointerDown = (e: PointerEvent<HTMLElement>) => {
      // Evitamos “drag” al tocar botones.
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("button")) return;

      lastUserInteractionAtRef.current = Date.now();

      pointerIdRef.current = e.pointerId;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      isDraggingRef.current = true;
      velocityRef.current.x = 0;
      velocityRef.current.y = 0;
      dragAccRef.current.x = 0;
      dragAccRef.current.y = 0;
      lastPointRef.current.x = e.clientX;
      lastPointRef.current.y = e.clientY;
    };

    const onPointerMove = (e: PointerEvent<HTMLElement>) => {
      if (!isDraggingRef.current) {
        // aun si no hay drag, actualizamos parallax con pointer move del showcase (sensación premium)
        if (!isReducedMotion) {
          const el = e.currentTarget;
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) / rect.width;
          const dy = (e.clientY - cy) / rect.height;
          const clamp = (v: number, a: number) => Math.max(-a, Math.min(a, v));
          parallaxRef.current.x = clamp(dx, 0.45);
          parallaxRef.current.y = clamp(dy, 0.35);
        }
        return;
      }

      if (pointerIdRef.current !== e.pointerId) return;

      const dx = e.clientX - lastPointRef.current.x;
      const dy = e.clientY - lastPointRef.current.y;
      lastPointRef.current.x = e.clientX;
      lastPointRef.current.y = e.clientY;

      dragAccRef.current.x += dx;
      dragAccRef.current.y += dy;

      // En mobile, simplificamos: no rotamos tanto. Swipe es la interacción principal.
      const mobileFactor = isMobile ? 0.35 : 1.0;
      const yawDelta = dx * sensitivityYaw * mobileFactor;
      const pitchDelta = -dy * sensitivityPitch * mobileFactor;

      // Permitimos que OrbitScene integre con damping e inercia
      velocityRef.current.y = yawDelta;
      velocityRef.current.x = pitchDelta;
    };

    const endDrag = (e: PointerEvent<HTMLElement>) => {
      if (pointerIdRef.current !== e.pointerId) return;
      isDraggingRef.current = false;
      pointerIdRef.current = null;

      const dx = dragAccRef.current.x;
      const dy = dragAccRef.current.y;

      // Swipe opcional en mobile
      if (isMobile && Math.abs(dx) > 48 && Math.abs(dy) < 110) {
        const dir = dx > 0 ? -1 : 1; // swipe right => prev (visual)
        transitionTo(activeIndexRef.current + dir);
      }
    };

    const onPointerUp = (e: PointerEvent<HTMLElement>) => endDrag(e);
    const onPointerCancel = (e: PointerEvent<HTMLElement>) => endDrag(e);

    const onPointerLeave = () => {
      isDraggingRef.current = false;
      pointerIdRef.current = null;
    };

    return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onPointerLeave };
  }, [activeIndex, isMobile, isReducedMotion, transitionTo, isStoryActiveRef]);

  return {
    variants,
    activeIndex,
    fromIndex,
    toIndex,
    activePreset,
    fromPreset,
    toPreset,
    mixRef,
    rotationOffsetRef,
    velocityRef,
    isDraggingRef,
    parallaxRef,
    goPrev,
    goNext,
    setVariantIndex,
    bindHeroParallax,
    bindShowcaseDrag,
    isMobile,
    isReducedMotion,
  };
}

export default useHeroOrbitalControls;

