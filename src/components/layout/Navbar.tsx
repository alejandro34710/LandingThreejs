function Navbar() {
  const navItems = ['Platform', 'Features', 'Solutions', 'Pricing'];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Contenedor tipo píldora flotante */}
      <nav className="w-full flex items-center justify-between border border-white/10 bg-[#02040A]/50 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:px-8">
        
        {/* Logo a la izquierda */}
        <a href="#hero" className="group flex items-center gap-3">
          {/* Luz LED animada */}
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] transition-transform duration-300 group-hover:scale-125" />
          <span className="text-sm font-bold tracking-[0.35em] text-white transition-colors group-hover:text-cyan-100">
            ORBIT
          </span>
        </a>

        {/* Enlaces centrales (Ocultos en móvil, visibles en pantallas medianas o mayores) */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs font-semibold uppercase tracking-widest text-gray-400 transition-all duration-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Call to Action a la derecha */}
        <div className="flex items-center gap-4">
          <a
            href="#final-cta"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-purple-500/30 bg-purple-500/10 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:border-purple-500/60 hover:bg-purple-500/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] md:text-sm"
          >
            <span className="relative z-10">Get Started</span>
            {/* Efecto de brillo de luz que atraviesa el botón en hover */}
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </a>
        </div>
        
      </nav>
    </header>
  );
}

export default Navbar;