import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

export type StoryInteractionValue = {
  // Rotación acumulada (drift + retorno suave)
  rotX: number;
  rotY: number;
  velX: number;
  velY: number;

  // Parallax ([-1,1])
  parallaxX: number;
  parallaxY: number;

  // Intensidad por proximidad (0..1)
  hover: number;

  // Pulso (0..1) activado por click
  pulse: number;

  // Estado del drag (para amortiguar/retornar de forma premium)
  isDragging: boolean;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);
    onChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return reduced;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(media.matches);
    onChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return isMobile;
}

export type UseStoryInteractionArgs = {
  containerRef: RefObject<HTMLElement | null>;
};

function useStoryInteraction({ containerRef }: UseStoryInteractionArgs) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  const interactionRef = useRef<StoryInteractionValue>({
    rotX: 0,
    rotY: 0,
    velX: 0,
    velY: 0,
    parallaxX: 0,
    parallaxY: 0,
    hover: 0,
    pulse: 0,
    isDragging: false,
  });

  const internalRef = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    pulseStartAt: 0,
  });

  const pulseRafRef = useRef<number | null>(null);

  const canDrag = useMemo(() => !reducedMotion && !isMobile, [reducedMotion, isMobile]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPointerMove = (e: PointerEvent) => {
      if (!el) return;

      // Parallax siempre (aunque no arrastre).
      const rect = el.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;

      const nx = clamp(relX * 2 - 1, -1, 1);
      const ny = clamp((1 - relY) * 2 - 1, -1, 1);

      const dx = nx;
      const dy = ny;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Hover/proximidad: más cerca del centro => más intensidad.
      const hoverTarget = clamp(1 - dist / 1.05, 0, 1);

      interactionRef.current.parallaxX = nx;
      interactionRef.current.parallaxY = ny;
      interactionRef.current.hover = hoverTarget;

      if (!internalRef.current.isDragging) return;
      if (!canDrag) return;

      const sx = e.clientX - internalRef.current.lastX;
      const sy = e.clientY - internalRef.current.lastY;

      internalRef.current.lastX = e.clientX;
      internalRef.current.lastY = e.clientY;

      // Velocidad para inercia al rotar.
      interactionRef.current.velY += sx * 0.0013;
      interactionRef.current.velX += sy * 0.0013;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!canDrag) return;
      internalRef.current.isDragging = true;
      interactionRef.current.isDragging = true;
      internalRef.current.lastX = e.clientX;
      internalRef.current.lastY = e.clientY;
      // Captura para que el drag no se rompa fuera del canvas.
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };

    const onPointerUp = () => {
      internalRef.current.isDragging = false;
      interactionRef.current.isDragging = false;
    };

    const onPointerLeave = () => {
      internalRef.current.isDragging = false;
      interactionRef.current.hover = 0;
      interactionRef.current.isDragging = false;
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("pointerleave", onPointerLeave);

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [containerRef, canDrag]);

  useEffect(() => {
    return () => {
      if (pulseRafRef.current != null) cancelAnimationFrame(pulseRafRef.current);
    };
  }, []);

  const startPulseDecay = () => {
    // Si el loop ya está corriendo, solo actualizamos `pulseStartAt` en `bindPulse`.
    if (pulseRafRef.current != null) return;

    const pulseDurationMs = 850; // Aproxima el decaimiento anterior (0.02 por frame @ ~60fps)

    const tick = () => {
      const now = performance.now();
      const elapsed = now - internalRef.current.pulseStartAt;
      const nextPulse = Math.max(0, 1 - elapsed / pulseDurationMs);

      interactionRef.current.pulse = nextPulse;

      if (nextPulse > 0) {
        pulseRafRef.current = requestAnimationFrame(tick);
      } else {
        pulseRafRef.current = null;
      }
    };

    pulseRafRef.current = requestAnimationFrame(tick);
  };

  const bindPulse = () => {
    const now = performance.now();
    internalRef.current.pulseStartAt = now;
    interactionRef.current.pulse = 1;
    startPulseDecay();
  };

  return {
    reducedMotion,
    isMobile,
    interactionRef,
    bindPulse,
  };
}

export default useStoryInteraction;

