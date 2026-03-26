import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "../lib/gsap";
import usePerformanceMode from "./usePerformanceMode";

function useSmoothScroll() {
  const { isLowPowerMode, prefersReducedMotion } = usePerformanceMode();

  useEffect(() => {
    if (prefersReducedMotion) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      lerp: isLowPowerMode ? 0.16 : 0.1,
      smoothWheel: true,
    });

    let rafId = 0;
    let isPageVisible = document.visibilityState === "visible";

    const raf = (time: number) => {
      if (!isPageVisible) {
        rafId = 0;
        return;
      }
      lenis.raf(time);
      if (!isLowPowerMode) ScrollTrigger.update();
      rafId = window.requestAnimationFrame(raf);
    };

    const onVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
      if (isPageVisible && !rafId) {
        rafId = window.requestAnimationFrame(raf);
      }
    };

    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    document.addEventListener("visibilitychange", onVisibilityChange);
    rafId = window.requestAnimationFrame(raf);
    window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isLowPowerMode, prefersReducedMotion]);
}

export default useSmoothScroll;
