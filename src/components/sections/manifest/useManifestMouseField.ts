import { useEffect, useRef, type RefObject } from "react";

export type ManifestMouseFieldValue = {
  // Coordenadas normalizadas dentro de la sección: x,y en [-1, 1]
  normX: number;
  normY: number;

  // Intensidad actual (0..1) con easing; aumenta al entrar / se disipa al salir.
  strength: number;
};

type InternalMouseState = {
  normX: number;
  normY: number;
  targetNormX: number;
  targetNormY: number;
  strength: number;
  targetStrength: number;

  // Coordenadas en pixeles para el overlay DOM del glow.
  px: number;
  py: number;
  targetPx: number;
  targetPy: number;

  // Para disipar interacción si el usuario deja de mover el mouse.
  lastMoveAt: number;
};

type UseManifestMouseFieldArgs = {
  containerRef: RefObject<HTMLElement | null>;
  glowRef: RefObject<HTMLDivElement | null>;
};

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function useManifestMouseField({ containerRef, glowRef }: UseManifestMouseFieldArgs) {
  const mouseFieldRef = useRef<ManifestMouseFieldValue>({
    normX: 0,
    normY: 0,
    strength: 0,
  });

  const internalRef = useRef<InternalMouseState>({
    normX: 0,
    normY: 0,
    targetNormX: 0,
    targetNormY: 0,
    strength: 0,
    targetStrength: 0,
    px: 0,
    py: 0,
    targetPx: 0,
    targetPy: 0,
    lastMoveAt: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;
    const isCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
    if (isCoarsePointer) return;

    let rafId = 0;
    let isAnimating = false;
    let isVisible = document.visibilityState === "visible";

    const startLoop = () => {
      if (isAnimating || !isVisible) return;
      isAnimating = true;
      rafId = window.requestAnimationFrame(update);
    };

    const stopLoop = () => {
      if (!isAnimating) return;
      isAnimating = false;
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const update = () => {
      const s = internalRef.current;
      const now = performance.now();

      // Si el usuario no mueve el mouse, disipamos la interacción gradualmente.
      if (s.targetStrength > 0) {
        const idleMs = now - s.lastMoveAt;
        const decay = 1 - idleMs / 260;
        s.targetStrength = clamp01(decay);
      }

      // Damping suave y premium.
      s.normX += (s.targetNormX - s.normX) * 0.08;
      s.normY += (s.targetNormY - s.normY) * 0.08;
      // Subimos/derivamos un poco más rápido para que el mouse sea evidente.
      s.strength += (s.targetStrength - s.strength) * 0.14;
      s.px += (s.targetPx - s.px) * 0.12;
      s.py += (s.targetPy - s.py) * 0.12;

      const strength = clamp01(s.strength);
      mouseFieldRef.current = {
        normX: s.normX,
        normY: s.normY,
        strength,
      };

      // Cursor bloom (overlay DOM) - nunca bloquea interacción.
      glow.style.opacity = String(0.0 + strength * 0.85);
      glow.style.transform = `translate3d(${s.px}px, ${s.py}px, 0) translate(-50%, -50%) scale(${
        0.88 + strength * 0.18
      })`;

      const hasMotion =
        Math.abs(s.targetNormX - s.normX) > 0.002 ||
        Math.abs(s.targetNormY - s.normY) > 0.002 ||
        Math.abs(s.targetPx - s.px) > 0.2 ||
        Math.abs(s.targetPy - s.py) > 0.2 ||
        s.strength > 0.002 ||
        s.targetStrength > 0.002;
      if (!isVisible || !hasMotion) {
        isAnimating = false;
        rafId = 0;
        return;
      }
      rafId = window.requestAnimationFrame(update);
    };

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (!isVisible) stopLoop();
      else startLoop();
    };

    const onPointerMove = (e: PointerEvent) => {
      // En móvil (touch) evitamos interacción costosa e invasiva.
      if (e.pointerType === "touch") return;

      const rect = container.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      const nx = (relX / rect.width) * 2 - 1;
      // Invertimos Y para que arriba sea +1.
      const ny = (1 - relY / rect.height) * 2 - 1;

      internalRef.current.targetNormX = Math.max(-1, Math.min(1, nx));
      internalRef.current.targetNormY = Math.max(-1, Math.min(1, ny));
      internalRef.current.targetStrength = 1;
      internalRef.current.targetPx = relX;
      internalRef.current.targetPy = relY;
      internalRef.current.lastMoveAt = performance.now();
      startLoop();
    };

    const onPointerEnter = (e: PointerEvent) => {
      onPointerMove(e);
      internalRef.current.targetStrength = 1;
      internalRef.current.lastMoveAt = performance.now();
    };

    const onPointerLeave = () => {
      internalRef.current.targetStrength = 0;
      // Hacemos que el glow se vaya al centro con el mismo damping.
      internalRef.current.targetNormX = 0;
      internalRef.current.targetNormY = 0;
      internalRef.current.targetPx = container.clientWidth / 2;
      internalRef.current.targetPy = container.clientHeight / 2;
      startLoop();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerenter", onPointerEnter);
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      stopLoop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerenter", onPointerEnter);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [containerRef, glowRef]);

  return mouseFieldRef;
}

export default useManifestMouseField;

