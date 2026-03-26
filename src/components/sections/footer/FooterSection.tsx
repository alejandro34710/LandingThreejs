import { useMemo, useState } from "react";
import { footerColumns, footerLegalLinks } from "./footerData";

function FooterSection() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [openMobileColumn, setOpenMobileColumn] = useState<string>(footerColumns[0]?.title ?? "");

  return (
    <footer id="footer" className="relative overflow-hidden border-t border-white/10 bg-[#02040A]">
      {/* Fondos y Destellos Atmosféricos */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 95% 85% at 50% 10%, #000 30%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 95% 85% at 50% 10%, #000 30%, transparent 100%)",
          }}
        />
        <div className="absolute left-[-15%] top-[-40%] h-[700px] w-[700px] rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute right-[-25%] bottom-[-50%] h-[800px] w-[800px] rounded-full bg-fuchsia-600/10 blur-[150px]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(2,4,10,0.1) 0%, rgba(2,4,10,0.95) 50%, #02040A 120%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          
          {/* --- BRAND --- */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-4">
              {/* Logo Box */}
              <div className="group relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_25px_rgba(34,211,238,0.10)] backdrop-blur-xl transition-colors duration-500 hover:border-cyan-500/30 hover:bg-white/10">
                <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] transition-transform duration-500 group-hover:scale-125" />
              </div>
              
              <div>
                <div className="text-sm font-semibold tracking-[0.28em] text-white/90">
                  ORBIT
                </div>
                {/* Badge Status - Mejorado pero sutil */}
                <div className="group mt-1 flex cursor-default items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-white/45 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30 hover:text-cyan-200">
                  <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75 group-hover:bg-cyan-300" />
                    <span className="relative inline-flex h-1 w-1 rounded-full bg-cyan-400" />
                  </span>
                  System Online
                </div>
              </div>
            </div>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/50">
              A calm, premium interface for a futuristic system—built to feel
              inevitable from first glance to final action.
            </p>
          </div>

          {/* --- COLUMNS --- */}
          <div className="lg:col-span-8">
            <div className="hidden grid-cols-1 gap-10 sm:grid-cols-3 lg:grid">
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.26em] text-white/65">
                    {/* Decorador sutil de título de columna */}
                    <span className="h-0.5 w-0.5 rounded-full bg-white/40" />
                    {col.title}
                  </div>
                  <ul className="mt-5 space-y-3">
                    {col.links.map((link) => (
                      <li key={`${col.title}-${link.label}`}>
                        <a
                          href={link.href}
                          className="group inline-flex items-center gap-2 text-sm text-white/45 transition-colors duration-300 hover:text-cyan-300"
                        >
                          <span className="relative flex items-center gap-2">
                            {/* Corchetes sutiles que aparecen en hover */}
                            <span className="font-mono text-cyan-500/0 transition-all duration-300 group-hover:text-cyan-500/80">
                              {">"}
                            </span>
                            {link.label}
                            {/* La línea inferior (subrayado) más fina */}
                            <span className="absolute -bottom-1 left-0 h-px w-0 bg-cyan-500/50 transition-all duration-500 group-hover:w-full" />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="space-y-3 lg:hidden">
              {footerColumns.map((col) => {
                const isOpen = openMobileColumn === col.title;
                return (
                  <div
                    key={col.title}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenMobileColumn((prev) => (prev === col.title ? "" : col.title))
                      }
                    >
                      <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
                        <span className="h-1 w-1 rounded-full bg-cyan-400/80" />
                        {col.title}
                      </span>
                      <span className="text-cyan-300">{isOpen ? "−" : "+"}</span>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <ul className="min-h-0 space-y-3 px-4 pb-4">
                        {col.links.map((link) => (
                          <li key={`${col.title}-${link.label}`}>
                            <a
                              href={link.href}
                              className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors duration-300 hover:text-cyan-300"
                            >
                              <span className="font-mono text-cyan-500/80">{">"}</span>
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- DIVIDER MEJORADO --- */}
        <div className="relative mt-14 flex items-center">
          <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />
          {/* Pequeño destello en el centro de la línea */}
          <div className="absolute left-1/2 h-px w-32 -translate-x-1/2 bg-linear-to-r from-transparent via-cyan-500/30 to-transparent blur-[1px]" />
        </div>

        {/* --- BOTTOM ROW --- */}
        <div className="mt-8 flex flex-col gap-4 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-white/30">
            <span className="h-1 w-1 rounded-sm bg-white/20" />
            © {year} ORBIT. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6">
            {footerLegalLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="group relative text-[11px] font-bold uppercase tracking-[0.26em] text-white/35 transition-colors duration-300 hover:text-white/70"
              >
                {l.label}
                {/* Indicador superior al hacer hover */}
                <span className="absolute -top-3 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-cyan-500/50 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
        </div>
        
      </div>
    </footer>
  );
}

export default FooterSection;