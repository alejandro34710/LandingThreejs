import { useEffect, type RefObject } from "react";
import { gsap } from "../lib/gsap";

function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
    }, element);

    return () => {
      ctx.revert();
    };
  }, [ref]);
}

export default useReveal;
