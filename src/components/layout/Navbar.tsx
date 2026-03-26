import { useEffect, useState } from "react";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Platform", href: "#hero" },
    { label: "System", href: "#features" },
    { label: "Manifest", href: "#manifest" },
    { label: "Protocol", href: "#final-cta" },
  ];

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 overflow-x-clip">
      {/* Contenedor tipo píldora flotante */}
      <nav className="relative w-full overflow-x-clip border border-white/10 bg-[#02040A]/50 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:px-8">
        <div className="flex items-center justify-between">
        
        {/* Logo a la izquierda */}
        <a href="#hero" className="group flex min-w-0 items-center gap-2.5 sm:gap-3" onClick={closeMenu}>
          {/* Luz LED animada */}
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] transition-transform duration-300 group-hover:scale-125" />
          <span className="text-sm font-bold tracking-[0.28em] text-white transition-colors group-hover:text-cyan-100 sm:tracking-[0.35em]">
            ORBIT
          </span>
        </a>

        {/* Enlaces centrales (Ocultos en móvil, visibles en pantallas medianas o mayores) */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={closeMenu}
              className="text-xs font-semibold uppercase tracking-widest text-gray-400 transition-all duration-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Call to Action a la derecha */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href="#final-cta"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-purple-500/30 bg-purple-500/10 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:border-purple-500/60 hover:bg-purple-500/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] md:text-sm"
          >
            <span className="relative z-10">Get Started</span>
            {/* Efecto de brillo de luz que atraviesa el botón en hover */}
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </a>
        </div>

        <button
          type="button"
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-menu"
          className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/45 bg-[#071027] text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.2)] transition hover:border-cyan-300 hover:text-cyan-100 md:hidden"
          onClick={toggleMenu}
        >
          <span className="relative h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </span>
        </button>
        </div>

        <div
          id="mobile-nav-menu"
          className={`absolute inset-x-0 top-full overflow-hidden px-4 transition-all duration-300 md:hidden ${isMobileMenuOpen ? "max-h-80 pt-3 opacity-100" : "max-h-0 pt-0 opacity-0"}`}
        >
          <div className="w-full space-y-1 rounded-xl border border-white/10 bg-[#02040A]/95 p-3 backdrop-blur-xl">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-widest text-gray-300 transition hover:bg-white/5 hover:text-cyan-300"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#final-cta"
              onClick={closeMenu}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:border-purple-400/70 hover:bg-purple-500/25"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;