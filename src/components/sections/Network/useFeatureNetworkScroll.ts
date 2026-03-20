import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { gsap, ScrollTrigger } from "../../../lib/gsap";

type UseFeatureNetworkScrollParams = {
  sectionRef: MutableRefObject<HTMLElement | null>;
  stageRef: MutableRefObject<HTMLDivElement | null>;
  cardRefs: MutableRefObject<Array<HTMLElement | null>>;
  pathRefs: MutableRefObject<Array<SVGPathElement | null>>;
  dotRefs: MutableRefObject<Array<SVGCircleElement | null>>;
  pulseRef: MutableRefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  isMobile: boolean;
};

type PathState = { progress: number };

function useFeatureNetworkScroll({
  sectionRef,
  stageRef,
  cardRefs,
  pathRefs,
  dotRefs,
  pulseRef,
  reducedMotion,
  isMobile,
}: UseFeatureNetworkScrollParams) {
  const [activeCount, setActiveCount] = useState(reducedMotion ? 4 : 0);
  const [timelineProgress, setTimelineProgress] = useState(
    reducedMotion ? 1 : 0,
  );
  const pathStatesRef = useRef<PathState[]>([]);
  const previousCountRef = useRef<number>(reducedMotion ? 4 : 0);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;

    if (!section || !stage) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    const paths = pathRefs.current.filter(Boolean) as SVGPathElement[];
    const dots = dotRefs.current.filter(Boolean) as SVGCircleElement[];

    if (cards.length === 0 || paths.length === 0 || dots.length === 0) return;

    if (reducedMotion || isMobile) {
      previousCountRef.current = 4;

      cards.forEach((card) => {
        gsap.set(card, { opacity: 1, y: 0, scale: 1 });
      });

      paths.forEach((path, index) => {
        gsap.set(path, { opacity: 0.95, strokeDashoffset: 0 });

        const dot = dots[index];
        if (!dot) return;

        const length = path.getTotalLength();
        const point = path.getPointAtLength(length);

        gsap.set(dot, {
          opacity: 0.95,
          scale: 1,
          attr: { cx: point.x, cy: point.y },
        });
      });

      return;
    }

    const ctx = gsap.context(() => {
      cards.forEach((card) => {
        gsap.set(card, { opacity: 0, y: 26, scale: 0.97 });
      });

      pathStatesRef.current = paths.map(() => ({ progress: 0 }));

      paths.forEach((path, index) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;

        gsap.set(path, { opacity: 0 });

        const dot = dots[index];
        if (dot) {
          const startPoint = path.getPointAtLength(0);
          gsap.set(dot, {
            opacity: 0,
            scale: 0.7,
            transformOrigin: "center",
            attr: { cx: startPoint.x, cy: startPoint.y },
          });
        }
      });

      const internalTimeline = gsap.timeline({ paused: true });

      const holdDurationSeconds = 0.8;
      const cardRevealDuration = 0.75;
      const lineRevealDuration = 0.88;
      const betweenCardsDelay = 0.42;
      const lineAfterCardOffset = 0.34;
      const betweenPathsHold = 0.78;

      paths.forEach((path, index) => {
        const state = pathStatesRef.current[index];
        const dot = dots[index];

        internalTimeline
          .to(
            cards[index],
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: cardRevealDuration,
              ease: "power2.out",
            },
            index === 0 ? 0 : `>+${betweenCardsDelay}`,
          )
          .to(
            state,
            {
              progress: 1,
              duration: lineRevealDuration,
              ease: "power2.out",
              onUpdate: () => {
                const length = path.getTotalLength();
                const currentLength = Math.max(
                  0,
                  Math.min(length, length * state.progress),
                );

                path.style.strokeDashoffset = `${length - currentLength}`;

                gsap.set(path, {
                  opacity: state.progress > 0.002 ? 0.95 : 0,
                });

                if (dot) {
                  const point = path.getPointAtLength(currentLength);
                  gsap.set(dot, {
                    opacity: state.progress > 0.04 ? 0.95 : 0,
                    attr: { cx: point.x, cy: point.y },
                  });
                }
              },
            },
            `<+${lineAfterCardOffset}`,
          )
          .to({}, { duration: betweenPathsHold });
      });

      internalTimeline.to({}, { duration: holdDurationSeconds });

      const internalDuration = Math.max(internalTimeline.duration(), 0.001);

      // Curva más suave y uniforme
      const scrollEasePower = 1.35;

      const st = ScrollTrigger.create({
        trigger: stage,
        start: "top 10%",
        end: () => `+=${Math.max(stage.offsetHeight * 1.75, 1500)}`,
        scrub: 1.15,
        pin: stage,
        pinSpacing: true,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const scrollProgress = self.progress;

          const easedScrollProgress = Math.pow(scrollProgress, scrollEasePower);
          const timelineTime = internalDuration * easedScrollProgress;
          const timelineProgressClamped = timelineTime / internalDuration;

          internalTimeline.time(timelineTime);
          setTimelineProgress(timelineProgressClamped);

          // Sin curva extra aquí, para que el conteo no se amontone al final
          const activeProgress = timelineProgressClamped;

          const newCount = Math.max(
            0,
            Math.min(4, Math.floor(activeProgress * 4 + 0.0001)),
          );

          if (newCount !== previousCountRef.current) {
            if (newCount > previousCountRef.current && pulseRef.current) {
              gsap.fromTo(
                pulseRef.current,
                { opacity: 0.06, scale: 0.92 },
                {
                  opacity: 0.68,
                  scale: 1.13,
                  duration: 0.26,
                  yoyo: true,
                  repeat: 1,
                  ease: "power2.out",
                  overwrite: "auto",
                },
              );
            }

            previousCountRef.current = newCount;
            setActiveCount(newCount);
          }
        },
      });

      ScrollTrigger.refresh();

      return () => {
        st.kill();
        internalTimeline.kill();
      };
    }, section);

    return () => {
      ctx.revert();
      pathStatesRef.current = [];
    };
  }, [
    cardRefs,
    dotRefs,
    isMobile,
    pathRefs,
    pulseRef,
    reducedMotion,
    sectionRef,
    stageRef,
  ]);

  const computedActiveCount = reducedMotion || isMobile ? 4 : activeCount;
  const computedTimelineProgress =
    reducedMotion || isMobile ? 1 : timelineProgress;

  return {
    activeCount: computedActiveCount,
    timelineProgress: computedTimelineProgress,
  };
}

export default useFeatureNetworkScroll;