import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "../lib/gsap";

function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      ScrollTrigger.update();
      rafId = window.requestAnimationFrame(raf);
    };

    rafId = window.requestAnimationFrame(raf);
    window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
}

export default useSmoothScroll;
