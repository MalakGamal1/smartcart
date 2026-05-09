"use client";

const partners = [
  { name: "Apple", icon: "🍎", className: "text-foreground font-semibold" },
  { name: "Dell", icon: null, className: "font-bold text-[#0076CE] text-xl" },
  { name: "HP", icon: null, className: "font-bold italic text-[#0096D6] text-xl" },
  { name: "Lenovo", icon: null, className: "font-extrabold italic text-[#E2231A] text-xl" },
  { name: "ASUS", icon: null, className: "font-semibold tracking-widest text-[#00539B] text-lg" },
  { name: "Acer", icon: null, className: "font-bold text-[#87CEEB] text-xl" },
  { name: "MSI", icon: "🐉", className: "font-bold text-[#FF0000] text-lg" },
  { name: "Razer", icon: "🐍", className: "font-bold text-[#00FF00] text-lg" },
  { name: "Microsoft", icon: "🪟", className: "text-[#737373] font-semibold" },
];

export function PartnersSection() {
  // Duplicate the list so it can scroll infinitely
  const repeatedPartners = [...partners, ...partners];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-sky-50/80 to-background py-14 dark:from-sky-950/30 dark:to-background">
      {/* Decorative corners */}
      <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 border-l-2 border-b-2 border-sky-200/50 dark:border-sky-800/40" />
      <div className="pointer-events-none absolute -right-8 top-0 h-24 w-24 border-r-2 border-t-2 border-sky-200/50 dark:border-sky-800/40" />

      <div className="mx-auto max-w-5xl text-center px-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground sm:text-2xl">
          Top Brands We Carry
        </h2>
        <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-sky-400/80" />
      </div>

      {/* Marquee container */}
      <div className="mt-10 overflow-hidden w-full relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-sky-50/80 dark:from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-sky-50/80 dark:from-background to-transparent z-10" />
        
        <div className="animate-marquee gap-12 sm:gap-16 items-center pr-12 sm:pr-16">
          {repeatedPartners.map((p, i) => (
            <span
              key={`${p.name}-${i}`}
              className={`flex items-center gap-1.5 text-base font-semibold select-none sm:text-lg whitespace-nowrap ${p.className}`}
            >
              {p.icon ? <span className="text-sm">{p.icon}</span> : null}
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
