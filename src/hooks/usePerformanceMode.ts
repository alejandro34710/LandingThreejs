import { useEffect, useState } from "react";

type PerformanceMode = {
  isMobile: boolean;
  prefersReducedMotion: boolean;
  isCoarsePointer: boolean;
  isLowPowerMode: boolean;
};

function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(initial);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, [query]);

  return matches;
}

function usePerformanceMode(): PerformanceMode {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");

  return {
    isMobile,
    prefersReducedMotion,
    isCoarsePointer,
    isLowPowerMode: isMobile || prefersReducedMotion || isCoarsePointer,
  };
}

export default usePerformanceMode;
