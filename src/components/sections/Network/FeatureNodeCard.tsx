import type { FeatureNetworkItem } from "./featureNetworkData";

type FeatureNodeCardProps = {
  item: FeatureNetworkItem;
  index: number;
  active: boolean;
  emphasized: boolean;
  onHover: (index: number | null) => void;
  onFocus: (index: number | null) => void;
};

// Hicimos los gradientes más puros y vibrantes para los "Signal stacks"
const toneMap: Record<FeatureNetworkItem["tone"], string> = {
  cyan: "from-cyan-500 via-cyan-400 to-cyan-200",
  blue: "from-blue-600 via-blue-400 to-sky-200",
  violet: "from-violet-600 via-violet-400 to-fuchsia-200",
  indigo: "from-indigo-600 via-indigo-400 to-indigo-200",
};

function FeatureNodeCard({
  item,
  index,
  active,
  emphasized,
  onHover,
  onFocus,
}: FeatureNodeCardProps) {
  return (
    <article
      className={[
        "group relative flex min-h-[270px] w-[min(340px,calc(100vw-1.75rem))] flex-col overflow-hidden rounded-2xl p-6 backdrop-blur-2xl transition-all duration-500 ease-out max-sm:min-h-[260px] max-sm:p-5 max-sm:w-[min(320px,calc(100vw-1.5rem))]",
        active
          ? "border border-cyan-400/40 bg-[#0A0F26]/90 opacity-100 shadow-[0_0_32px_-8px_rgba(34,211,238,0.18),inset_0_1px_1px_rgba(255,255,255,0.1)]"
          : "border border-white/10 bg-[#070B1A]/70 opacity-50 hover:opacity-100 hover:bg-[#090D1D]/80",
        emphasized ? "border-cyan-300/70 shadow-[0_0_36px_-12px_rgba(34,211,238,0.22)]" : "",
      ].join(" ")}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onFocus(index)}
      onBlur={() => onFocus(null)}
      tabIndex={0}
    >
      {/* --- ELEMENTOS DECORATIVOS: Fondo y Brillos --- */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />

      {/* Destello sutil en la parte superior cuando está activa */}
      {active && (
        <div className="pointer-events-none absolute left-1/2 top-0 h-14 w-[70%] max-w-[200px] -translate-x-1/2 bg-cyan-400/15 blur-[26px]" />
      )}

      {/* Esquinas tipo HUD / Tech UI */}
      <div className="pointer-events-none absolute left-0 top-0 h-4 w-4 rounded-tl-2xl border-l border-t border-white/20 transition-colors group-hover:border-cyan-400/50" />
      <div className="pointer-events-none absolute right-0 top-0 h-4 w-4 rounded-tr-2xl border-r border-t border-white/20 transition-colors group-hover:border-cyan-400/50" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 rounded-bl-2xl border-b border-l border-white/20 transition-colors group-hover:border-cyan-400/50" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 rounded-br-2xl border-b border-r border-white/20 transition-colors group-hover:border-cyan-400/50" />
      {/* ----------------------------------------------- */}

      {/* HEADER */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Luz indicadora de estado */}
          <span
            className={[
              "relative flex h-2 w-2 items-center justify-center",
              active ? "text-cyan-400" : "text-white/20",
            ].join(" ")}
          >
            {active && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60"></span>}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 transition-colors group-hover:text-cyan-100">
            {item.badge}
          </span>
        </div>

        <span className="flex items-center gap-1 rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 text-[10px] font-mono text-white/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
          <span className="text-cyan-500/50">/</span>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <h3 className="relative z-10 text-lg font-semibold tracking-tight text-white/95 transition-colors duration-300 group-hover:text-white">
        {item.title}
      </h3>
      <p className="relative z-10 mt-2 line-clamp-2 min-h-[2.7rem] text-sm leading-relaxed text-slate-400">
        {item.description}
      </p>

      {/* MODULO DE SIGNAL STACK (Estilo Inset / Pantalla integrada) */}
      <div className="relative z-10 mt-auto min-h-0 rounded-xl border border-white/5 bg-[#03050A]/60 p-4 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)] backdrop-blur-md max-sm:p-3.5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">Signal stack</span>
          <span className={`text-[9px] font-mono uppercase tracking-wider ${active ? "text-cyan-300 shadow-cyan-300/20 drop-shadow-md" : "text-white/30"}`}>
            {active ? "Active" : "Standby"}
          </span>
        </div>

        <div className="space-y-2.5">
          {item.miniRows.map((row, miniIndex) => (
            <div
              key={`${item.id}-${miniIndex}`}
              className="group/row flex min-w-0 items-center gap-2 sm:gap-2.5"
            >
              <span
                className={[
                  "h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-500",
                  active ? "bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.6)] opacity-100" : "bg-white/10 opacity-60",
                ].join(" ")}
              />

              <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/5 shadow-inner">
                <div
                  className={[
                    "relative h-full transition-all duration-1000 ease-out",
                    "bg-linear-to-r",
                    toneMap[item.tone],
                    active ? "w-[88%]" : "w-[12%]",
                  ].join(" ")}
                >
                  <div className="absolute bottom-0 right-0 top-0 w-4 bg-white/40 blur-[1px]" />
                </div>
              </div>

              <span
                className="max-w-[40%] shrink-0 truncate text-right text-[9px] font-medium leading-tight text-white/40 transition-colors group-hover/row:text-white/60 sm:max-w-[9.5rem]"
                title={row}
              >
                {row}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default FeatureNodeCard;
