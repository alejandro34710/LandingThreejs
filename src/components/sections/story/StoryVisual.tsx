import { useEffect, useRef } from "react";
import StoryAbstractSculpture from "./StoryAbstractSculpture";
import useStoryInteraction from "./useStoryInteraction";

function StoryVisual({
  onPulse,
}: {
  onPulse?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { reducedMotion, isMobile, interactionRef, bindPulse } =
    useStoryInteraction({
      containerRef,
    });

  useEffect(() => {
    if (!onPulse) return;
    onPulse();
  }, [onPulse]);

  return (
    <div
      ref={containerRef}
      className="r3f-surface relative h-full w-full touch-none select-none"
      // Drag/parallax se resuelve vía listeners en el hook.
    >
      {/* Halo DOM detrás del objeto (responde a hover en el canvas) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(94,208,255,0.22),transparent_58%)] opacity-70 blur-2xl"
        style={{
          transform: reducedMotion ? "none" : "translateZ(0)",
          transition: "opacity 300ms ease",
        }}
      />

      <div className="relative h-full w-full">
        <StoryAbstractSculpture
          interactionRef={interactionRef}
          reducedMotion={reducedMotion}
          isMobile={isMobile}
        />
      </div>

      {/* Click / pulse: lo activamos con un manejador del contenedor */}
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-transparent opacity-0"
        aria-label="Pulse story nebula"
        onClick={() => {
          if (isMobile) return;
          bindPulse();
        }}
      />
    </div>
  );
}

export default StoryVisual;

