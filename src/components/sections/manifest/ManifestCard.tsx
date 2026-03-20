import type { ReactNode } from "react";
import type { ManifestCardData, ManifestVisualKind } from "./manifestData";

function VisualGeometric() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -left-6 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-cyan-400/15 blur-xl" />
        <div className="absolute -right-6 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-purple-500/15 blur-xl" />
      </div>

      <svg
        viewBox="0 0 120 120"
        className="relative h-14 w-14 transition-transform duration-300 group-hover:rotate-2 group-hover:scale-105"
        fill="none"
      >
        <path
          d="M60 14 L92 32 L92 70 L60 86 L28 70 L28 32 Z"
          stroke="rgba(199,249,255,0.65)"
          strokeWidth="1.5"
        />
        <path
          d="M60 28 L78 38 L78 60 L60 70 L42 60 L42 38 Z"
          stroke="rgba(185,168,255,0.55)"
          strokeWidth="1.3"
        />
        <path
          d="M28 32 C44 48, 76 48, 92 32"
          stroke="rgba(34,211,238,0.35)"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}

function VisualModules() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute left-0 top-0 h-20 w-20 rounded-full bg-cyan-400/10 blur-xl" />
        <div className="absolute right-0 bottom-0 h-28 w-28 rounded-full bg-purple-500/10 blur-xl" />
      </div>

      <div className="relative grid h-full grid-cols-3 gap-2 p-2">
        <div className="rounded-lg border border-white/10 bg-white/5 transition-transform duration-300 group-hover:-translate-y-1" />
        <div className="rounded-lg border border-white/10 bg-white/5 transition-transform duration-300 group-hover:translate-y-1" />
        <div className="rounded-lg border border-white/10 bg-white/5 transition-transform duration-300 group-hover:translate-x-1" />

        <div className="col-span-2 row-span-2 rounded-xl border border-cyan-300/20 bg-linear-to-b from-cyan-400/10 to-purple-500/5 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" />
        <div className="rounded-lg border border-white/10 bg-white/5 transition-transform duration-300 group-hover:-translate-x-1" />
      </div>

      <div className="absolute bottom-3 left-4 right-4 h-px bg-linear-to-r from-transparent via-cyan-300/40 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}

function VisualTracking() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute left-0 top-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-xl" />
        <div className="absolute right-0 bottom-0 h-24 w-24 rounded-full bg-purple-500/10 blur-xl" />
      </div>

      <div className="relative flex h-full flex-col justify-center gap-3 px-4">
        {[
          { dot: "bg-cyan-300/80", w: "w-2/3" },
          { dot: "bg-purple-300/75", w: "w-3/5" },
          { dot: "bg-white/70", w: "w-1/2" },
        ].map((row, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div
              className={`h-1.5 w-1.5 rounded-full ${row.dot} opacity-80 transition-transform duration-300 group-hover:-translate-y-px`}
            />
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-linear-to-r from-cyan-400/80 to-purple-400/70 opacity-70 transition-all duration-300 ${row.w} group-hover:w-full`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderVisual(kind: ManifestVisualKind): ReactNode {
  switch (kind) {
    case "geometric":
      return <VisualGeometric />;
    case "modules":
      return <VisualModules />;
    case "tracking":
      return <VisualTracking />;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

type ManifestCardProps = {
  card: ManifestCardData;
};

function ManifestCard({ card }: ManifestCardProps) {
  return (
    <article
      data-manifest-card
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-8 pb-10 pt-16 shadow-[0_0_60px_rgba(34,211,238,0.05)] transition-all duration-300 will-change-transform hover:-translate-y-2 hover:border-cyan-300/30 hover:bg-white/7"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -left-24 top-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.16),transparent_55%)]" />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-linear-to-r from-cyan-400/0 via-cyan-400/15 to-purple-500/0 blur-2xl opacity-50 transition-opacity duration-300 group-hover:opacity-90" />

      <div className="absolute left-8 top-6 -translate-y-1/2 rounded-full border border-white/10 bg-[#02040A]/70 px-3 py-1 text-[12px] font-semibold tracking-[0.22em] text-white/80 shadow-[0_0_24px_rgba(34,211,238,0.15)] backdrop-blur-md transition-colors duration-300 group-hover:border-cyan-300/30">
        {card.number}
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="min-h-[108px]">
          <h3 className="text-2xl font-semibold tracking-tight text-white">
            {card.title}
          </h3>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-white/60">
            {card.description}
          </p>
        </div>

        <div className="mt-6 h-24 rounded-xl border border-white/10 bg-[#02040A]/35 p-3 transition-colors duration-300 group-hover:border-cyan-300/20">
          {renderVisual(card.visualKind)}
        </div>
      </div>
    </article>
  );
}

export default ManifestCard;

