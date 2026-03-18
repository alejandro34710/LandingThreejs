function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 bg-slate-950/25 px-6 py-4 backdrop-blur-xl sm:px-8 lg:px-10">
        <a
          href="#hero"
          className="text-sm font-semibold tracking-[0.35em] text-white/90 transition hover:text-white"
        >
          ORBIT
        </a>

        <a
          href="#final-cta"
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white/90 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          Get Started
        </a>
      </nav>
    </header>
  );
}

export default Navbar;
