import type { FeatureItem } from "./featuresData";

type FeatureCardProps = {
  item: FeatureItem;
  index: number;
  isActive: boolean;
  onActivate: (id: string) => void;
  onDeactivate?: () => void;
};

function FeatureCard({
  item,
  index,
  isActive,
  onActivate,
  onDeactivate,
}: FeatureCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 ${
        isActive
          ? "border-cyan-500/50 bg-white/8 shadow-[0_20px_60px_-15px_rgba(34,211,238,0.2)]"
          : "border-white/10 bg-white/2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-white/20 hover:bg-white/4"
      }`}
      onMouseEnter={() => onActivate(item.id)}
      onFocus={() => onActivate(item.id)}
      onMouseLeave={() => onDeactivate?.()}
      onBlur={() => onDeactivate?.()}
      onClick={() => onActivate(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate(item.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Activar ${item.title}`}
    >
      {/* Indicador lateral activo */}
      <div className={`absolute left-0 top-0 h-full w-1 bg-linear-to-b from-cyan-400 to-blue-600 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`} />

      {/* Brackets decorativos (Esquinas) */}
      <div className={`absolute left-4 top-4 h-3 w-3 border-l-2 border-t-2 transition-colors duration-300 ${isActive ? "border-cyan-400" : "border-white/20"}`} />
      <div className={`absolute right-4 top-4 h-3 w-3 border-r-2 border-t-2 transition-colors duration-300 ${isActive ? "border-cyan-400" : "border-white/20"}`} />
      <div className={`absolute left-4 bottom-4 h-3 w-3 border-b-2 border-l-2 transition-colors duration-300 ${isActive ? "border-cyan-400" : "border-white/20"}`} />
      <div className={`absolute right-4 bottom-4 h-3 w-3 border-b-2 border-r-2 transition-colors duration-300 ${isActive ? "border-cyan-400" : "border-white/20"}`} />

      {/* Gradiente de fondo radial */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 mix-blend-screen ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
        }`}
        style={{
          background: `radial-gradient(400px circle at 80% 90%, ${item.accentFrom}30, transparent 70%)`,
        }}
      />

      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between mb-8">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
            <span className="font-mono text-cyan-400">{String(index + 1).padStart(2, "0")}</span>
            {item.eyebrow}
          </p>
          <span className={`rounded-lg border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${isActive ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-white/10 bg-black/40 text-white/40"}`}>
            {item.chip}
          </span>
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-white mb-3 drop-shadow-md">
          {item.title}
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-gray-400 font-light">
          {item.description}
        </p>

        {/* Módulo Inferior: Simulador de Datos Animados */}
        <div className="mt-8 rounded-xl border border-white/5 bg-black/50 p-4 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.2em] text-gray-500">
            <span>Telemetría</span>
            <span className={isActive ? "text-cyan-400 animate-pulse" : ""}>{isActive ? "Analizando..." : "Standby"}</span>
          </div>

          <div className="flex items-end gap-[6px] h-10">
            {[...Array(12)].map((_, i) => {
              // Variacion determinista para evitar Math.random durante render.
              const seed = (index + 1) * (i + 3);
              const animDuration = 0.9 + ((seed * 37) % 100) / 100;
              const animDelay = ((seed * 19) % 80) / 100;
              return (
                <span
                  key={`${item.id}-bar-${i}`}
                  className="relative block flex-1 overflow-hidden rounded-sm bg-white/5"
                  style={{ height: '100%' }}
                >
                  <span
                    className="absolute inset-x-0 bottom-0 rounded-sm transition-opacity duration-300"
                    style={{
                      height: isActive ? '100%' : '20%',
                      background: `linear-gradient(180deg, ${item.accentFrom}, transparent)`,
                      opacity: isActive ? 1 : 0.3,
                      animation: isActive
                        ? `data-bar ${animDuration}s ease-in-out ${animDelay}s infinite alternate`
                        : 'none',
                    }}
                  />
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

export default FeatureCard;