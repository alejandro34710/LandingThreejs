import { useEffect, useMemo, useRef, useState } from "react";
import SectionContainer from "../../layout/SectionContainer";
import FeatureConnectionLines from "./FeatureConnectionLines";
import FeatureNetworkSphere from "./FeatureNetworkSphere";
import FeatureNodeCard from "./FeatureNodeCard";
import { featureNetworkItems } from "./featureNetworkData";
import useFeatureNetworkScroll from "./useFeatureNetworkScroll";
import { gsap } from "../../../lib/gsap";

function FeatureNetworkSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const dotRefs = useRef<Array<SVGCircleElement | null>>([]);
  const pulseRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);
  const sphereWrapRef = useRef<HTMLDivElement | null>(null);
  const hudWrapRef = useRef<HTMLDivElement | null>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [sphereSelectedIndex, setSphereSelectedIndex] = useState<number | null>(
    reducedMotion ? 0 : null,
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMedia = window.matchMedia("(max-width: 1023px)");

    const updateMotion = () => setReducedMotion(media.matches);
    const updateMobile = () => setIsMobile(mobileMedia.matches);

    updateMotion();
    updateMobile();

    media.addEventListener("change", updateMotion);
    mobileMedia.addEventListener("change", updateMobile);

    return () => {
      media.removeEventListener("change", updateMotion);
      mobileMedia.removeEventListener("change", updateMobile);
    };
  }, []);

  const { activeCount, timelineProgress } = useFeatureNetworkScroll({
    sectionRef,
    stageRef,
    cardRefs,
    pathRefs,
    dotRefs,
    pulseRef,
    reducedMotion,
    isMobile,
  });

  const coreIntensity = useMemo(() => {
    return Math.min(
      1,
      Math.max(
        0,
        timelineProgress * 0.9 + (hoverIndex === null ? 0.08 : 0.16),
      ),
    );
  }, [hoverIndex, timelineProgress]);

  useEffect(() => {
    if (reducedMotion || isMobile) return;

    const badgeEl = badgeRef.current;
    const titleEl = titleRef.current;
    const descriptionEl = descriptionRef.current;
    const sphereEl = sphereWrapRef.current;
    const hudEl = hudWrapRef.current;

    if (!badgeEl || !titleEl || !descriptionEl || !sphereEl || !hudEl) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 92%",
          // Se reproduce una sola vez para evitar repetición en scroll.
          // `toggleActions` mantiene el resto estable.
          toggleActions: "play none none none",
        },
      });

      // Nota: `immediateRender: false` evita que GSAP “toque” el estado inicial
      // antes de que el ScrollTrigger entre, manteniendo visible el título/esfera.
      tl.from(badgeEl, {
        opacity: 0,
        y: 10,
        duration: 0.75,
        filter: "blur(7px)",
        immediateRender: false,
      })
        .from(
          titleEl,
          {
            opacity: 0,
            y: 16,
            duration: 0.95,
            filter: "blur(10px)",
            immediateRender: false,
          },
          "-=0.25",
        )
        .from(
          descriptionEl,
          {
            opacity: 0,
            y: 10,
            duration: 0.75,
            filter: "blur(6px)",
            immediateRender: false,
          },
          "-=0.35",
        )
        .from(
          sphereEl,
          {
            opacity: 0,
            y: 10,
            scale: 1,
            duration: 1,
            filter: "blur(8px)",
            immediateRender: false,
          },
          "-=0.65",
        )
        .from(
          hudEl,
          {
            opacity: 0,
            y: 8,
            duration: 0.65,
            filter: "blur(6px)",
            immediateRender: false,
          },
          "-=0.35",
        );
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [reducedMotion, isMobile]);

  return (
    <SectionContainer
      ref={sectionRef}
      className="relative overflow-visible border-t border-cyan-500/10 bg-[#02040A] py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[48px_48px]"
          style={{
            maskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)",
          }}
        />
        <div className="absolute left-[20%] top-[30%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/15 blur-[140px]" />
        <div className="absolute right-[10%] top-[60%] h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-fuchsia-600/15 blur-[150px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[800px] -translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div
            ref={badgeRef}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-4 py-1.5 shadow-[0_0_20px_rgba(34,211,238,0.15)] backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200">
              System Intelligence
            </span>
          </div>

          <h2
            ref={titleRef}
            className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg"
          >
            One core. Four modules.{" "}
            <br className="hidden sm:block" />
            <span className="bg-linear-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(192,132,252,0.3)]">
              A network that awakens through scroll.
            </span>
          </h2>

          <p
            ref={descriptionRef}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400"
          >
            Each stage activates a real capability of the system, lighting up
            the connection from the central core to complete a living,
            coordinated architecture.
          </p>
        </div>

        <div
          ref={stageRef}
          className="group relative h-[82svh] min-h-[760px] max-h-[960px] overflow-hidden rounded-[40px] border border-white/10 p-px shadow-[0_20px_80px_-20px_rgba(139,92,246,0.3)]"
        >
          <div className="absolute inset-0 z-0 bg-linear-to-br from-cyan-500/40 via-transparent to-fuchsia-500/40 opacity-80" />

          <div className="relative z-10 flex h-full w-full flex-col overflow-hidden rounded-[39px] bg-[#030614]/90 backdrop-blur-3xl">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-screen"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
                maskImage:
                  "radial-gradient(ellipse 90% 90% at 50% 50%, #000 20%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 90% 90% at 50% 50%, #000 20%, transparent 100%)",
              }}
            />

            <div className="pointer-events-none absolute -top-[20%] left-[10%] h-[50%] w-[80%] rounded-full bg-cyan-500/10 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-[20%] right-[10%] h-[50%] w-[80%] rounded-full bg-fuchsia-600/10 blur-[100px]" />

            <div className="pointer-events-none absolute left-8 top-8 h-12 w-12 rounded-tl-2xl border-l-[3px] border-t-[3px] border-cyan-500/30 transition-all duration-500 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            <div className="pointer-events-none absolute right-8 top-8 h-12 w-12 rounded-tr-2xl border-r-[3px] border-t-[3px] border-indigo-500/30 transition-all duration-500 group-hover:border-indigo-400 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <div className="pointer-events-none absolute bottom-8 left-8 h-12 w-12 rounded-bl-2xl border-b-[3px] border-l-[3px] border-fuchsia-500/30 transition-all duration-500 group-hover:border-fuchsia-400 group-hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
            <div className="pointer-events-none absolute bottom-8 right-8 h-12 w-12 rounded-br-2xl border-b-[3px] border-r-[3px] border-fuchsia-500/30 transition-all duration-500 group-hover:border-fuchsia-400 group-hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]" />

            <div className="pointer-events-none absolute left-[20%] top-[20%] font-mono text-[8px] text-white/10">
              +
            </div>
            <div className="pointer-events-none absolute right-[20%] bottom-[30%] font-mono text-[8px] text-white/10">
              +
            </div>

            <div
              ref={pulseRef}
              className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-[80px] transition-opacity duration-300"
              style={{ opacity: 0.15 + timelineProgress * 0.4 }}
            />

            <div
              ref={sphereWrapRef}
          className="pointer-events-auto absolute left-1/2 top-1/2 z-20 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 cursor-grab hover:cursor-pointer active:cursor-grabbing touch-none select-none outline-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            const isEnter = e.key === "Enter";
            const isSpace = e.key === " ";
            if (!isEnter && !isSpace) return;

            e.preventDefault();
            setSphereSelectedIndex((prev) => {
              const next = (prev ?? -1) + 1;
              return next >= featureNetworkItems.length ? 0 : next;
            });
          }}
            >
              <FeatureNetworkSphere
                intensity={coreIntensity}
                reducedMotion={reducedMotion}
            onSphereClick={() => {
              setSphereSelectedIndex((prev) => {
                const next = (prev ?? -1) + 1;
                return next >= featureNetworkItems.length ? 0 : next;
              });
            }}
              />
            </div>

            <FeatureConnectionLines
              items={featureNetworkItems}
              activeCount={activeCount}
          highlightIndex={hoverIndex ?? sphereSelectedIndex}
              pathRefs={pathRefs}
              dotRefs={dotRefs}
              mobile={isMobile}
            />

            {featureNetworkItems.map((item, index) => {
              const position = isMobile
                ? item.position.mobile
                : item.position.desktop;

              return (
                <div
                  key={item.id}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  className="absolute left-0 top-0 z-30 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                  }}
                >
                  <FeatureNodeCard
                    item={item}
                    index={index}
                    active={index < activeCount}
                    emphasized={
                      hoverIndex === index || (hoverIndex === null && sphereSelectedIndex === index)
                    }
                    onHover={setHoverIndex}
                    onFocus={setHoverIndex}
                  />
                </div>
              );
            })}

            <div
              ref={hudWrapRef}
              className="pointer-events-none absolute inset-x-0 bottom-10 z-40 flex justify-center"
            >
              <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-[#02040A]/90 px-6 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-100/70">
                    System Link
                  </span>
                </div>

                <div className="h-1.5 w-32 overflow-hidden rounded-full border border-white/5 bg-white/5">
                  <div
                  className="h-full bg-linear-to-r from-cyan-400 via-indigo-400 to-fuchsia-500 shadow-[0_0_12px_rgba(192,132,252,0.8)] transition-all duration-300 ease-out"
                    style={{
                      width: `${Math.max(5, timelineProgress * 100)}%`,
                    }}
                  />
                </div>

                <span className="w-10 text-right font-mono text-[11px] font-semibold text-fuchsia-300">
                  {Math.round(timelineProgress * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

export default FeatureNetworkSection;